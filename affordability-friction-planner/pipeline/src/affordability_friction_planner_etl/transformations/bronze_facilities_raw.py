from pyspark import pipelines as dp

from ..shared import SOURCE_FACILITIES


@dp.materialized_view(
    name="bronze_facilities_raw",
    comment="Raw facilities snapshot from the hackathon source catalog.",
)
def bronze_facilities_raw():
    return spark.read.table(SOURCE_FACILITIES)
