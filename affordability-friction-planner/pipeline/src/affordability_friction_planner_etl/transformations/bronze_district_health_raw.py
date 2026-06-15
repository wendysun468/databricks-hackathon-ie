from pyspark import pipelines as dp

from ..shared import SOURCE_DISTRICT_HEALTH


@dp.materialized_view(
    name="bronze_district_health_raw",
    comment="Raw district health snapshot from NFHS-5.",
)
def bronze_district_health_raw():
    return spark.read.table(SOURCE_DISTRICT_HEALTH)
