from pyspark import pipelines as dp
from pyspark.sql import functions as F


@dp.materialized_view(
    name="silver_pincode_directory_clean",
    comment="Normalized pincode directory with coordinates and geography keys.",
)
def silver_pincode_directory_clean():
    df = spark.read.table("bronze_pincode_directory_raw")

    return (
        df.select(
            F.trim(F.col("circlename")).alias("circlename"),
            F.trim(F.col("regionname")).alias("regionname"),
            F.trim(F.col("divisionname")).alias("divisionname"),
            F.trim(F.col("officename")).alias("officename"),
            F.col("pincode").cast("long").alias("pincode"),
            F.trim(F.col("officetype")).alias("officetype"),
            F.trim(F.col("delivery")).alias("delivery"),
            F.trim(F.col("district")).alias("district"),
            F.trim(F.col("statename")).alias("statename"),
            F.regexp_replace(F.col("latitude").cast("string"), r"[^0-9.\-]+", "").cast("double").alias("latitude"),
            F.regexp_replace(F.col("longitude").cast("string"), r"[^0-9.\-]+", "").cast("double").alias("longitude"),
        )
        .withColumn(
            "district_key",
            F.lower(F.regexp_replace(F.coalesce(F.col("district"), F.lit("")), r"[^a-zA-Z0-9]+", "")),
        )
        .withColumn(
            "state_key",
            F.lower(F.regexp_replace(F.coalesce(F.col("statename"), F.lit("")), r"[^a-zA-Z0-9]+", "")),
        )
        .withColumn("pincode_key", F.col("pincode").cast("string"))
        .withColumn("has_coordinates", F.col("latitude").isNotNull() & F.col("longitude").isNotNull())
    )
