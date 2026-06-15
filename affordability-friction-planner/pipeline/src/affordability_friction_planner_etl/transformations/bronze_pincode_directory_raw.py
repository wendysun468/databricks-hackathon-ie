from pyspark import pipelines as dp

from ..shared import SOURCE_PINCODE


@dp.materialized_view(
    name="bronze_pincode_directory_raw",
    comment="Raw India Post pincode directory snapshot.",
)
def bronze_pincode_directory_raw():
    return spark.read.table(SOURCE_PINCODE)
