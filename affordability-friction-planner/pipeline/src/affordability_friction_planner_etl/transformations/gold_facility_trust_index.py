from pyspark import pipelines as dp
from pyspark.sql import functions as F


@dp.materialized_view(
    name="gold_facility_trust_index",
    comment="Facility-level trust index for shortlist and explanation layers.",
)
def gold_facility_trust_index():
    df = spark.read.table("silver_facilities_geocoded")

    return (
        df.withColumn(
            "trust_band",
            F.when(F.col("trust_score") >= 80, F.lit("strong"))
            .when(F.col("trust_score") >= 60, F.lit("partial"))
            .when(F.col("trust_score") >= 35, F.lit("weak"))
            .otherwise(F.lit("none")),
        )
        .withColumn(
            "evidence_quality_label",
            F.when(F.col("trust_band") == "strong", F.lit("Strong"))
            .when(F.col("trust_band") == "partial", F.lit("Partial"))
            .when(F.col("trust_band") == "weak", F.lit("Weak"))
            .otherwise(F.lit("None")),
        )
        .select(
            "unique_id",
            "facility_name",
            "resolved_district_name",
            "resolved_state_name",
            "postal_code_int",
            "latitude_clean",
            "longitude_clean",
            "trust_score",
            "trust_band",
            "evidence_quality_label",
            "evidence_strength",
            "join_confidence",
            "has_maternal_signal",
            "has_provenance",
            "has_coordinates",
            "source_url_count",
            "website_count",
            "specialty_count",
            "procedure_count",
            "equipment_count",
            "capability_count",
        )
    )
