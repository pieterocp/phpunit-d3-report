// Compatibility tweaks
window.URL = window.URL || window.webkitURL;

var THEME_STORAGE_KEY = "phpunit-d3-report-theme";

// Global variables
var chart = d3.chart.phpunitBubbles().padding(2);
var jsonReport = null;

initTheme();

// Load Symfony2 test suite sample
d3.json("reports/symfony2.json", function(err, data) {
    jsonReport = data;

    d3.select("#bubbles")
        .datum(data)
        .call(chart);

    displaySlowestTests(data);
});

// Update chart with user submitted data
document.getElementById("report_form").addEventListener("submit", function(e) {
    e.preventDefault();

    document.getElementById("sample_introduction").innerText = "Here is your custom report:";

    var report = document.getElementById("report").value;
    jsonReport = ReportTransformer.transform(report);

    d3.select("#bubbles")
        .datum(jsonReport)
        .call(chart);

    displaySlowestTests(jsonReport);

    window.scrollTo(0);
});

function displaySlowestTests(data) {
    var slowestTests = data.slice().sort(function(a, b) {
        return b.time - a.time;
    }).slice(0, 10);

    var html = "<h3>Top 10 Slowest Tests</h3>";
    html += "<table class='table table-striped'>";
    html += "<thead><tr><th>Time</th><th>Test</th></tr></thead>";
    html += "<tbody>";

    for (var i = 0; i < slowestTests.length; i++) {
        var test = slowestTests[i];
        html += "<tr>";
        html += "<td>" + renderDuration(test.time) + "</td>";
        html += "<td>" + test.name + "</td>";
        html += "</tr>";
    }

    html += "</tbody>";
    html += "</table>";

    document.getElementById("slowest-tests").innerHTML = html;
}

function renderDuration(seconds) {
    var milliseconds = seconds * 1000;
    if (milliseconds < 1000) {
        return Math.round(milliseconds) + "ms";
    }

    var duration = moment.duration(milliseconds);
    var sec = duration.get("seconds");
    if (sec < 10) {
        sec = "0" + sec;
    }

    return duration.get("minutes") + ":" + sec;
}

// Add tooltip details on hover
d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Authorize JSON report download (for external embedding)
document.getElementById("json_report_download_link").addEventListener("click", function(e) {
    var blob = new Blob([JSON.stringify(jsonReport)]);
    var url =window.URL.createObjectURL(blob);

    this.href = url;
    this.download = 'phpunit-d3-report.json';
});

function initTheme() {
    var toggleButton = document.getElementById("theme-toggle");
    var initialTheme = getInitialTheme();

    applyTheme(initialTheme);

    toggleButton.addEventListener("click", function() {
        var nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
        applyTheme(nextTheme);

        try {
            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch (e) {
            // Ignore localStorage failures in restricted environments.
        }
    });
}

function getInitialTheme() {
    try {
        var savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
    } catch (e) {
        // Continue with system preference fallback.
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }

    return "light";
}

function applyTheme(theme) {
    var toggleButton = document.getElementById("theme-toggle");
    var isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);
    toggleButton.innerText = isDark ? "Light mode" : "Dark mode";
    toggleButton.setAttribute("aria-pressed", isDark ? "true" : "false");
}

