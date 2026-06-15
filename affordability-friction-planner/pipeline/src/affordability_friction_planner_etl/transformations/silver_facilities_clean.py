from pyspark import pipelines as dp
from pyspark.sql import functions as F
from pyspark.sql import types as T

from ..shared import classify_evidence, normalize_key, normalize_text, parse_json_list


def _array(col_name: str):
    return F.from_json(F.col(col_name), T.ArrayType(T.StringType()))


def _first_non_empty(*columns):
    expr = None
    for col in columns:
        candidate = F.when(F.length(F.trim(F.col(col))) > 0, F.col(col))
        expr = candidate if expr is None else expr.when(F.length(F.trim(F.col(col))) > 0, F.col(col))
    return expr


@dp.materialized_view(
    name="silver_facilities_clean",
    comment="Normalized facilities with parsed arrays, geocodes, and evidence strength.",
)
def silver_facilities_clean():
    df = spark.read.table("bronze_facilities_raw")

    parsed = (
        df.withColumn("source_types_array", _array("source_types"))
        .withColumn("source_ids_array", _array("source_ids"))
        .withColumn("phone_numbers_array", _array("phone_numbers"))
        .withColumn("websites_array", _array("websites"))
        .withColumn("source_urls_array", _array("source_urls"))
        .withColumn("specialties_array", _array("specialties"))
        .withColumn("procedure_array", _array("procedure"))
        .withColumn("equipment_array", _array("equipment"))
        .withColumn("capability_array", _array("capability"))
        .withColumn("facility_name", F.trim(F.col("name")))
        .withColumn("organization_type_clean", F.lower(F.trim(F.col("organization_type"))))
        .withColumn("facility_type", F.lower(F.trim(F.col("facilityTypeId"))))
        .withColumn("operator_type", F.lower(F.trim(F.col("operatorTypeId"))))
        .withColumn("city_clean", F.trim(F.col("address_city")))
        .withColumn("state_clean", F.trim(F.col("address_stateOrRegion")))
        .withColumn("postal_code", F.regexp_extract(F.col("address_zipOrPostcode").cast("string"), r"(\d{5,6})", 1))
        .withColumn("postal_code_int", F.when(F.length("postal_code") > 0, F.col("postal_code").cast("long")))
        .withColumn("latitude_clean", F.col("latitude").cast("double"))
        .withColumn("longitude_clean", F.col("longitude").cast("double"))
        .withColumn("source_url_count", F.size("source_urls_array"))
        .withColumn("website_count", F.size("websites_array"))
        .withColumn("specialty_count", F.size("specialties_array"))
        .withColumn("procedure_count", F.size("procedure_array"))
        .withColumn("equipment_count", F.size("equipment_array"))
        .withColumn("capability_count", F.size("capability_array"))
        .withColumn(
            "text_blob",
            F.lower(
                F.concat_ws(
                    " | ",
                    F.coalesce(F.col("specialties"), F.lit("")),
                    F.coalesce(F.col("description"), F.lit("")),
                    F.coalesce(F.col("capability"), F.lit("")),
                    F.coalesce(F.col("procedure"), F.lit("")),
                    F.coalesce(F.col("equipment"), F.lit("")),
                    F.coalesce(F.col("source_urls"), F.lit("")),
                )
            ),
        )
        .withColumn(
            "has_maternal_signal",
            F.col("text_blob").rlike("maternal|maternity|delivery|obstetric|obstetrics|antenatal|postnatal|newborn|gyne|gynec"),
        )
        .withColumn(
            "has_provenance",
            (F.col("source_url_count") > 0) | (F.col("website_count") > 0),
        )
        .withColumn(
            "has_coordinates",
            F.col("latitude_clean").isNotNull() & F.col("longitude_clean").isNotNull(),
        )
        .withColumn("district_key", F.lit(None).cast("string"))
        .withColumn("state_key", F.lower(F.regexp_replace(F.coalesce(F.col("state_clean"), F.lit("")), r"[^a-zA-Z0-9]+", "")))
        .withColumn("city_key", F.lower(F.regexp_replace(F.coalesce(F.col("city_clean"), F.lit("")), r"[^a-zA-Z0-9]+", "")))
        .withColumn(
            "postal_key",
            F.lower(F.regexp_replace(F.coalesce(F.col("postal_code"), F.lit("")), r"[^a-zA-Z0-9]+", "")),
        )
        .withColumn(
            "location_key",
            F.concat_ws("__", F.coalesce(F.col("city_key"), F.lit("")), F.coalesce(F.col("state_key"), F.lit("")), F.coalesce(F.col("postal_key"), F.lit(""))),
        )
        .withColumn(
            "evidence_strength",
            F.when(
                F.col("has_provenance") & ((F.col("capability_count") + F.col("procedure_count") + F.col("equipment_count")) >= 1) & (F.length(F.col("text_blob")) >= 90),
                F.lit("strong"),
            )
            .when(
                (F.col("has_provenance") & (F.length(F.col("text_blob")) >= 35))
                | (((F.col("capability_count") + F.col("procedure_count") + F.col("equipment_count")) >= 2) & (F.length(F.col("text_blob")) >= 35)),
                F.lit("partial"),
            )
            .when(F.length(F.col("text_blob")) > 0, F.lit("weak"))
            .otherwise(F.lit("none")),
        )
        .withColumn(
            "trust_score",
            F.when(F.col("evidence_strength") == "strong", F.lit(90))
            .when(F.col("evidence_strength") == "partial", F.lit(68))
            .when(F.col("evidence_strength") == "weak", F.lit(40))
            .otherwise(F.lit(12)),
        )
    )

    return parsed.select(
        "unique_id",
        "source_content_id",
        "name",
        "facility_name",
        "organization_type",
        "organization_type_clean",
        "facility_type",
        "operator_type",
        "address_line1",
        "address_line2",
        "address_line3",
        "city_clean",
        "state_clean",
        "postal_code_int",
        "latitude_clean",
        "longitude_clean",
        "description",
        "specialties_array",
        "procedure_array",
        "equipment_array",
        "capability_array",
        "source_urls_array",
        "source_url_count",
        "website_count",
        "specialty_count",
        "procedure_count",
        "equipment_count",
        "capability_count",
        "has_maternal_signal",
        "has_provenance",
        "has_coordinates",
        "location_key",
        "evidence_strength",
        "trust_score",
    )
