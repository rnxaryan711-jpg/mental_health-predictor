const API_BASE =
    window.location.protocol === "http:" ||
    window.location.protocol === "https:"
        ? window.location.origin
        : "https://mental-health-predictor-1-b0at.onrender.com";


// --------------------------------------------------
// DOM ELEMENTS
// --------------------------------------------------

const form = document.getElementById("predict-form");

const resultSection =
    document.getElementById("state-result");

const resultValueEl =
    document.getElementById("score-number");

const errorSection =
    document.getElementById("state-error");

const loadingSection =
    document.getElementById("state-loading");

const idleSection =
    document.getElementById("state-idle");

const errorCopyEl =
    document.getElementById("error-copy");

const resultSummaryEl =
    document.getElementById("score-context");

const resultBandEl =
    document.getElementById("score-band");

const submitButton =
    document.getElementById("submit-btn");

const stressHiddenInput =
    document.getElementById("stress_level");

const gaugeFillEl =
    document.getElementById("gauge-fill");

const resetButton =
    document.getElementById("reset-btn");

const retryButton =
    document.getElementById("error-retry-btn");


// --------------------------------------------------
// STATE MANAGEMENT
// --------------------------------------------------

function showState(state) {

    if (idleSection) {
        idleSection.hidden = state !== "idle";
    }

    if (loadingSection) {
        loadingSection.hidden = state !== "loading";
    }

    if (resultSection) {
        resultSection.hidden = state !== "result";
    }

    if (errorSection) {
        errorSection.hidden = state !== "error";
    }
}


// --------------------------------------------------
// STRESS LEVEL BUTTONS
// --------------------------------------------------

const stressButtons =
    document.querySelectorAll("#stress_level_group .seg-btn");

stressButtons.forEach(button => {

    button.addEventListener("click", () => {

        stressButtons.forEach(other => {
            other.classList.remove("active");
            other.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        stressHiddenInput.value = button.dataset.value;

        if (stressHiddenInput) {
            setFieldError(stressHiddenInput, "");
        }
    });
});


// --------------------------------------------------
// RESET / RETRY BUTTONS
// --------------------------------------------------

function backToIdle() {

    showState("idle");
    clearFieldErrors();
}

if (resetButton) {
    resetButton.addEventListener("click", backToIdle);
}

if (retryButton) {
    retryButton.addEventListener("click", backToIdle);
}


// --------------------------------------------------
// ERROR DISPLAY
// --------------------------------------------------

function renderError(label, copy) {

    if (errorCopyEl) {
        errorCopyEl.textContent =
            `${label}: ${copy}`;
    }

    showState("error");
}


// --------------------------------------------------
// FORM DATA
// --------------------------------------------------

function collectPayload() {

    const fd = new FormData(form);

    return {

        age:
            fd.get("age") === ""
                ? NaN
                : parseInt(fd.get("age"), 10),

        gender:
            fd.get("gender") || "",

        country:
            (fd.get("country") || "").trim(),

        academic_level:
            fd.get("academic_level") || "",

        most_used_platform:
            fd.get("most_used_platform") || "",

        purpose_of_use:
            fd.get("purpose_of_use") || "",

        avg_daily_usage_hours:
            fd.get("avg_daily_usage_hours") === ""
                ? NaN
                : parseFloat(
                    fd.get("avg_daily_usage_hours")
                ),

        daily_unlocks:
            fd.get("daily_unlocks") === ""
                ? NaN
                : parseInt(
                    fd.get("daily_unlocks"),
                    10
                ),

        study_hours:
            fd.get("study_hours") === ""
                ? NaN
                : parseFloat(
                    fd.get("study_hours")
                ),

        physical_activity_hours:
            fd.get("physical_activity_hours") === ""
                ? NaN
                : parseFloat(
                    fd.get("physical_activity_hours")
                ),

        sleep_hours_per_night:
            fd.get("sleep_hours_per_night") === ""
                ? NaN
                : parseFloat(
                    fd.get("sleep_hours_per_night")
                ),

        stress_level:
            fd.get("stress_level") || ""
    };
}


// --------------------------------------------------
// CONVERT FRONTEND DATA TO FASTAPI DATA
// --------------------------------------------------

function toApiPayload(p) {

    return {

        Age: p.age,

        Gender: p.gender.toLowerCase(),

        Country: p.country,

        Academic_Level:
            p.academic_level.toLowerCase(),

        Most_Used_Platform:
            p.most_used_platform,

        Purpose_Of_Use:
            p.purpose_of_use,

        Avg_Daily_Usage_Hours:
            p.avg_daily_usage_hours,

        Daily_Unlocks:
            p.daily_unlocks,

        Study_Hours:
            p.study_hours,

        Physical_Activity_Hours:
            p.physical_activity_hours,

        Sleep_Hours_Per_Night:
            p.sleep_hours_per_night,

        Stress_Level:
            p.stress_level
    };
}


// --------------------------------------------------
// CLIENT-SIDE VALIDATION
// --------------------------------------------------

function validate(payload) {

    const errors = [];


    const numericChecks = [

        ["age", "age", 10, 100],

        [
            "avg_daily_usage_hours",
            "avg_daily_usage_hours",
            0,
            24
        ],

        [
            "daily_unlocks",
            "daily_unlocks",
            0,
            Infinity
        ],

        [
            "study_hours",
            "study_hours",
            0,
            24
        ],

        [
            "physical_activity_hours",
            "physical_activity_hours",
            0,
            24
        ],

        [
            "sleep_hours_per_night",
            "sleep_hours_per_night",
            0,
            24
        ]
    ];


    numericChecks.forEach(
        ([apiKey, htmlId, min, max]) => {

            const input =
                document.getElementById(htmlId);

            const value =
                payload[apiKey];

            if (
                value === "" ||
                value === null ||
                Number.isNaN(value)
            ) {

                errors.push([
                    input,
                    "This field is required."
                ]);

            } else if (
                value < min ||
                value > max
            ) {

                errors.push([
                    input,
                    `Must be between ${min} and ${
                        max === Infinity
                            ? "0+"
                            : max
                    }.`
                ]);
            }
        }
    );


    const requiredFields = [

        ["gender", "gender"],

        ["country", "country"],

        ["academic_level", "academic_level"],

        [
            "most_used_platform",
            "most_used_platform"
        ],

        [
            "purpose_of_use",
            "purpose_of_use"
        ]
    ];


    requiredFields.forEach(
        ([apiKey, htmlId]) => {

            const input =
                document.getElementById(htmlId);

            if (
                !payload[apiKey] ||
                String(payload[apiKey]).trim() === ""
            ) {

                errors.push([
                    input,
                    "This field is required."
                ]);
            }
        }
    );


    if (!payload.stress_level) {

        errors.push([
            stressHiddenInput,
            "Pick a stress level."
        ]);
    }


    return errors;
}


// --------------------------------------------------
// FIELD ERROR
// --------------------------------------------------

function setFieldError(input, message) {

    if (!input) return;

    const fieldWrapper =
        input.closest(".field");

    const errorElement =
        document.querySelector(
            `.error-msg[data-for="${input.id}"]`
        );

    if (message) {

        if (fieldWrapper) {
            fieldWrapper.classList.add("field-error");
        }

    } else {

        if (fieldWrapper) {
            fieldWrapper.classList.remove("field-error");
        }
    }

    if (errorElement) {
        errorElement.textContent = message || "";
    }
}


// --------------------------------------------------
// CLEAR FIELD ERRORS
// --------------------------------------------------

function clearFieldErrors() {

    document
        .querySelectorAll(".field-error")
        .forEach(element => {
            element.classList.remove("field-error");
        });

    document
        .querySelectorAll(".error-msg")
        .forEach(element => {
            element.textContent = "";
        });
}


// --------------------------------------------------
// SERVER VALIDATION ERRORS
// --------------------------------------------------

function applyServerValidationErrors(detail) {

    if (!Array.isArray(detail)) {
        return false;
    }


    const fieldMap = {

        Age: "age",

        Gender: "gender",

        Country: "country",

        Academic_Level:
            "academic_level",

        Most_Used_Platform:
            "most_used_platform",

        Purpose_Of_Use:
            "purpose_of_use",

        Avg_Daily_Usage_Hours:
            "avg_daily_usage_hours",

        Daily_Unlocks:
            "daily_unlocks",

        Study_Hours:
            "study_hours",

        Physical_Activity_Hours:
            "physical_activity_hours",

        Sleep_Hours_Per_Night:
            "sleep_hours_per_night",

        Stress_Level:
            "stress_level"
    };


    let matched = false;


    detail.forEach(err => {

        const field =
            Array.isArray(err.loc)
                ? err.loc[err.loc.length - 1]
                : null;


        const htmlId =
            fieldMap[field];


        if (!htmlId) return;


        const input =
            field === "Stress_Level"
                ? stressHiddenInput
                : document.getElementById(
                    htmlId
                );


        if (input) {

            setFieldError(
                input,
                err.msg || "Invalid value."
            );

            matched = true;
        }
    });


    return matched;
}


// --------------------------------------------------
// RESULT DISPLAY
// --------------------------------------------------

function displayResult(score) {

    if (resultValueEl) {

        resultValueEl.textContent =
            Number(score).toFixed(2);
    }


    if (gaugeFillEl) {

        const clamped =
            Math.min(Math.max(Number(score), 0), 10);

        gaugeFillEl.style.strokeDashoffset =
            String(314 * (1 - clamped / 10));
    }


    if (resultBandEl) {

        let band = "";

        if (score < 4) {

            band = "Low";

        } else if (score < 7) {

            band = "Moderate";

        } else {

            band = "High";
        }

        resultBandEl.textContent = band;
    }


    if (resultSummaryEl) {

        resultSummaryEl.textContent =
            "Your predicted mental health score has been calculated.";
    }


    showState("result");
}


// --------------------------------------------------
// FORM SUBMISSION
// --------------------------------------------------

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        clearFieldErrors();


        const payload =
            collectPayload();


        const errors =
            validate(payload);


        if (errors.length > 0) {

            errors.forEach(
                ([input, message]) => {

                    setFieldError(
                        input,
                        message
                    );
                }
            );

            renderError(
                "Invalid input",
                "Please correct the highlighted fields."
            );

            return;
        }


        const apiPayload =
            toApiPayload(payload);


        showState("loading");


        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add("loading");
        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/predict`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                apiPayload
                            )
                    }
                );


            let data = null;


            try {

                data =
                    await response.json();

            } catch (jsonError) {

                data = null;
            }


            // -----------------------------
            // Validation error
            // -----------------------------

            if (response.status === 422) {

                const matched =
                    applyServerValidationErrors(
                        data?.detail
                    );


                if (matched) {

                    renderError(
                        "Invalid input",
                        "Please correct the highlighted fields."
                    );

                } else {

                    renderError(
                        "Validation error",
                        "The submitted data does not match the API requirements."
                    );
                }

                return;
            }


            // -----------------------------
            // Other HTTP errors
            // -----------------------------

            if (!response.ok) {

                const message =
                    data?.detail ||
                    data?.message ||
                    `Server returned ${response.status}.`;

                renderError(
                    "Prediction failed",
                    String(message)
                );

                return;
            }


            // -----------------------------
            // Successful prediction
            // -----------------------------

            const score =
                data?.predicted_mental_health_score;


            if (
                score === undefined ||
                score === null
            ) {

                renderError(
                    "Invalid response",
                    "The server did not return a prediction."
                );

                return;
            }


            displayResult(score);
        }


        catch (error) {

            console.error(
                "Prediction request failed:",
                error
            );


            renderError(
                "Connection error",
                "Unable to reach the prediction server. Please try again."
            );
        }


        finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove("loading");
            }
        }
    }
);
