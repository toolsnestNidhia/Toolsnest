/* =========================================
   ToolNest Age Calculator
   ========================================= */


const dobInput = document.getElementById("dob");
const asOfInput = document.getElementById("asOf");

const calculateBtn = document.getElementById("calculateBtn");

const errorMessage = document.getElementById("errorMessage");

const resultSection = document.getElementById("resultSection");

const exactAge = document.getElementById("exactAge");
const ageInWords = document.getElementById("ageInWords");

const totalYears = document.getElementById("totalYears");
const totalMonths = document.getElementById("totalMonths");
const totalWeeks = document.getElementById("totalWeeks");
const totalDays = document.getElementById("totalDays");

const nextBirthday = document.getElementById("nextBirthday");
const daysUntilBirthday = document.getElementById("daysUntilBirthday");
const birthDay = document.getElementById("birthDay");

const copyBtn = document.getElementById("copyBtn");
const copyMessage = document.getElementById("copyMessage");

const currentYear = document.getElementById("currentYear");


/* =========================================
   Date helpers
   ========================================= */


/*
 * Create a local date without timezone-related
 * problems caused by new Date("YYYY-MM-DD").
 */
function createDateFromInput(value) {

    const parts = value.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}


/*
 * Convert a Date object to YYYY-MM-DD.
 */
function formatInputDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/*
 * Remove the time portion from a date.
 */
function startOfDay(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


/*
 * Number of days in a month.
 */
function daysInMonth(year, month) {

    return new Date(
        year,
        month + 1,
        0
    ).getDate();
}


/* =========================================
   Today's date
   ========================================= */

const today = startOfDay(new Date());

asOfInput.value = formatInputDate(today);

currentYear.textContent = today.getFullYear();


/* =========================================
   Calculate calendar age
   ========================================= */

function calculateCalendarAge(birthDate, endDate) {

    let years =
        endDate.getFullYear() -
        birthDate.getFullYear();

    let months =
        endDate.getMonth() -
        birthDate.getMonth();

    let days =
        endDate.getDate() -
        birthDate.getDate();


    /*
     * Borrow days from the previous month
     * when the day difference is negative.
     */
    if (days < 0) {

        months--;

        const previousMonthDays =
            daysInMonth(
                endDate.getFullYear(),
                endDate.getMonth() - 1
            );

        days += previousMonthDays;
    }


    /*
     * Borrow months when the month difference
     * is negative.
     */
    if (months < 0) {

        years--;

        months += 12;
    }


    return {
        years,
        months,
        days
    };
}


/* =========================================
   Total days
   ========================================= */

function getTotalDays(birthDate, endDate) {

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.floor(
        (endDate - birthDate) /
        millisecondsPerDay
    );
}


/* =========================================
   Birthday handling
   ========================================= */


/*
 * For February 29 birthdays, use February 28
 * during non-leap years.
 */
function getBirthdayForYear(
    birthDate,
    year
) {

    const month =
        birthDate.getMonth();

    const originalDay =
        birthDate.getDate();


    if (
        month === 1 &&
        originalDay === 29 &&
        !isLeapYear(year)
    ) {

        return new Date(
            year,
            1,
            28
        );
    }


    return new Date(
        year,
        month,
        originalDay
    );
}


/*
 * Determine whether a year is a leap year.
 */
function isLeapYear(year) {

    return (
        year % 4 === 0 &&
        (
            year % 100 !== 0 ||
            year % 400 === 0
        )
    );
}


/*
 * Find the next birthday after the reference date.
 */
function getNextBirthday(
    birthDate,
    referenceDate
) {

    let year =
        referenceDate.getFullYear();

    let birthday =
        getBirthdayForYear(
            birthDate,
            year
        );


    if (birthday < referenceDate) {

        year++;

        birthday =
            getBirthdayForYear(
                birthDate,
                year
            );
    }


    return birthday;
}


/* =========================================
   Formatting
   ========================================= */

function formatNumber(number) {

    return number.toLocaleString(
        "en-US"
    );
}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


function formatShortDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


/* =========================================
   Main calculation
   ========================================= */

function calculateAge() {

    hideError();


    if (!dobInput.value) {

        showError(
            "Please enter your date of birth."
        );

        resultSection.hidden = true;

        return;
    }


    if (!asOfInput.value) {

        showError(
            "Please select the date to calculate your age as of."
        );

        resultSection.hidden = true;

        return;
    }


    const birthDate =
        createDateFromInput(
            dobInput.value
        );


    const referenceDate =
        createDateFromInput(
            asOfInput.value
        );


    /*
     * Validate dates.
     */
    if (
        Number.isNaN(birthDate.getTime()) ||
        Number.isNaN(referenceDate.getTime())
    ) {

        showError(
            "Please enter valid dates."
        );

        resultSection.hidden = true;

        return;
    }


    /*
     * Birth date cannot be in the future
     * relative to the reference date.
     */
    if (birthDate > referenceDate) {

        showError(
            "Date of birth cannot be after the calculation date."
        );

        resultSection.hidden = true;

        return;
    }


    /*
     * Calculate exact calendar age.
     */
    const age =
        calculateCalendarAge(
            birthDate,
            referenceDate
        );


    /*
     * Calculate total days.
     */
    const days =
        getTotalDays(
            birthDate,
            referenceDate
        );


    const weeks =
        Math.floor(days / 7);


    const months =
        age.years * 12 +
        age.months;


    /*
     * Age in decimal years.
     */
    const decimalYears =
        (days / 365.2425).toFixed(2);


    /* =====================================
       Display exact age
       ===================================== */

    exactAge.textContent =
        `${age.years} ${plural(
            age.years,
            "year"
        )}, ${age.months} ${plural(
            age.months,
            "month"
        )}, ${age.days} ${plural(
            age.days,
            "day"
        )}`;


    ageInWords.textContent =
        `Approximately ${decimalYears} years old`;


    /* =====================================
       Display totals
       ===================================== */

    totalYears.textContent =
        formatNumber(age.years);


    totalMonths.textContent =
        formatNumber(months);


    totalWeeks.textContent =
        formatNumber(weeks);


    totalDays.textContent =
        formatNumber(days);


    /* =====================================
       Birthday information
       ===================================== */

    const birthday =
        getNextBirthday(
            birthDate,
            referenceDate
        );


    const birthdayDays =
        getTotalDays(
            referenceDate,
            birthday
        );


    nextBirthday.textContent =
        formatShortDate(birthday);


    daysUntilBirthday.textContent =
        `${formatNumber(
            birthdayDays
        )} ${plural(
            birthdayDays,
            "day"
        )}`;


    birthDay.textContent =
        formatDate(birthDate);


    /* =====================================
       Show results
       ===================================== */

    resultSection.hidden = false;

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================
   Plural helper
   ========================================= */

function plural(
    number,
    singular
) {

    return number === 1
        ? singular
        : `${singular}s`;
}


/* =========================================
   Error handling
   ========================================= */

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.hidden = false;
}


function hideError() {

    errorMessage.textContent = "";

    errorMessage.hidden = true;
}


/* =========================================
   Copy result
   ========================================= */

copyBtn.addEventListener(
    "click",
    async function () {

        const resultText =
            `My age is ${exactAge.textContent}. ` +
            `I was born on ${formatDate(
                createDateFromInput(
                    dobInput.value
                )
            )}. ` +
            `My next birthday is ${nextBirthday.textContent}.`;


        try {

            await navigator.clipboard.writeText(
                resultText
            );

        } catch (error) {

            /*
             * Fallback for browsers where
             * Clipboard API isn't available.
             */
            const temporary =
                document.createElement("textarea");

            temporary.value =
                resultText;

            document.body.appendChild(
                temporary
            );

            temporary.select();

            document.execCommand(
                "copy"
            );

            temporary.remove();
        }


        copyMessage.hidden = false;


        setTimeout(
            () => {
                copyMessage.hidden = true;
            },
            2500
        );
    }
);


/* =========================================
   Calculate button
   ========================================= */

calculateBtn.addEventListener(
    "click",
    calculateAge
);


/* =========================================
   Allow Enter key
   ========================================= */

dobInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            calculateAge();
        }

    }
);


asOfInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            calculateAge();
        }

    }
);
