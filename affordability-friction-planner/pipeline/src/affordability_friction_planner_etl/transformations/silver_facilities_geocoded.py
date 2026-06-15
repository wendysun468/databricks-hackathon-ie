from pyspark import pipelines as dp
from pyspark.sql import functions as F


@dp.materialized_view(
    name="silver_facilities_geocoded",
    comment="Facilities enriched with pincode-derived district and state matches.",
)
def silver_facilities_geocoded():
    facilities = spark.read.table("silver_facilities_clean")
    pincodes = spark.read.table("silver_pincode_directory_clean")

    pincode_lookup = (
        pincodes.select(
            F.col("pincode").alias("postal_code_int"),
            F.col("district").alias("resolved_district_name"),
            F.col("statename").alias("resolved_state_name"),
            F.col("district_key").alias("resolved_district_key"),
            F.col("state_key").alias("resolved_state_key"),
        )
        .dropDuplicates(["postal_code_int"])
    )

    enriched = (
        facilities.join(pincode_lookup, on="postal_code_int", how="left")
        .withColumn(
            "join_confidence",
            F.when(F.col("resolved_district_key").isNotNull(), F.lit("exact_pincode"))
            .when(F.col("state_key").isNotNull(), F.lit("state_only"))
            .otherwise(F.lit("unmatched")),
        )
        .withColumn(
            "facility_geography_key",
            F.concat_ws("__", F.coalesce(F.col("resolved_district_key"), F.col("city_key")), F.coalesce(F.col("resolved_state_key"), F.col("state_key"))),
        )
    )

    return enriched.select(
        "unique_id",
        "source_content_id",
        "facility_name",
        "organization_type_clean",
        "facility_type",
        "operator_type",
        "city_clean",
        "state_clean",
        "postal_code_int",
        "latitude_clean",
        "longitude_clean",
        "resolved_district_name",
        "resolved_state_name",
        "resolved_district_key",
        "resolved_state_key",
        "join_confidence",
        "facility_geography_key",
        "has_maternal_signal",
        "has_provenance",
        "has_coordinates",
        "evidence_strength",
        "trust_score",
        "source_url_count",
        "website_count",
        "specialty_count",
        "procedure_count",
        "equipment_count",
        "capability_count",
        "source_urls_array",
        "specialties_array",
        "procedure_array",
        "equipment_array",
        "capability_array",
    )
