from pyspark import pipelines as dp
from pyspark.sql import functions as F

from ..shared import burden_score_from_row, normalize_key, normalize_percent, parse_float


DISTRICT_FEATURE_COLUMNS = [
    "households_surveyed",
    "population_below_age_15_years_pct",
    "sex_ratio_total_f_per_1000_m",
    "hh_member_covered_health_insurance_pct",
    "women_age_15_49_who_are_literate_pct",
    "women_age_15_49_with_10_or_more_years_of_schooling_pct",
    "mothers_who_had_an_anc_visit_in_the_first_trimester_lb5y_pct",
    "mothers_who_had_at_least_4_anc_visits_lb5y_pct",
    "mothers_whose_last_birth_was_protected_against_neo_tetanus_pct",
    "mothers_who_consumed_ifa_for_100_days_or_more_when_they_wer_pct",
    "mothers_who_consumed_ifa_for_180_days_or_more_when_they_wer_pct",
    "registered_pregnancies_for_which_the_mother_received_a_mcp_pct",
    "mothers_who_received_pnc_from_a_doctor_nurse_lhv_anm_midwif_pct",
    "average_out_of_pocket_expenditure_per_delivery_in_a_public_fac",
    "institutional_birth_5y_pct",
    "institutional_birth_in_public_facility_5y_pct",
    "births_attended_by_skilled_hp_5y_10_pct",
    "births_delivered_by_csection_5y_pct",
    "all_w15_49_who_are_anaemic_pct",
    "women_age_15_49_years_whose_bmi_bmi_is_underweight_bmi_lt_1_pct",
    "women_age_15_49_years_who_are_overweight_obese_bmi_gte_25_0_pct",
    "women_age_15_49_years_who_have_high_risk_whr_gte_0_85_pct",
    "w15_plus_who_use_any_kind_of_tobacco_pct",
    "m15_plus_who_use_any_kind_of_tobacco_pct",
    "w15_plus_who_consume_alcohol_pct",
    "m15_plus_who_consume_alcohol_pct",
]


@dp.materialized_view(
    name="silver_district_health_clean",
    comment="Normalized district health features with a maternal burden score.",
)
def silver_district_health_clean():
    df = spark.read.table("bronze_district_health_raw")

    cleaned = df.select(
        F.trim(F.col("district_name")).alias("district_name"),
        F.trim(F.col("state_ut")).alias("state_ut"),
        *[
            F.regexp_replace(F.col(column).cast("string"), r"[^0-9.\-]+", "").cast("double").alias(column)
            for column in DISTRICT_FEATURE_COLUMNS
        ],
    ).withColumn(
        "district_key",
        F.lower(F.regexp_replace(F.coalesce(F.col("district_name"), F.lit("")), r"[^a-zA-Z0-9]+", "")),
    ).withColumn(
        "state_key",
        F.lower(F.regexp_replace(F.coalesce(F.col("state_ut"), F.lit("")), r"[^a-zA-Z0-9]+", "")),
    )

    pdf = cleaned.toPandas()
    pdf["burden_score"] = pdf.apply(lambda row: burden_score_from_row(row.to_dict()), axis=1)
    pdf["burden_band"] = pdf["burden_score"].map(
        lambda score: "critical" if score >= 80 else "high" if score >= 60 else "moderate" if score >= 35 else "low"
    )
    pdf["burden_source_completeness"] = pdf[
        [
            "hh_member_covered_health_insurance_pct",
            "women_age_15_49_who_are_literate_pct",
            "mothers_who_had_an_anc_visit_in_the_first_trimester_lb5y_pct",
            "mothers_who_had_at_least_4_anc_visits_lb5y_pct",
            "institutional_birth_in_public_facility_5y_pct",
        ]
    ].notna().sum(axis=1)

    return spark.createDataFrame(pdf)
