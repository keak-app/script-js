const HOST = "https://api.keak.com";

function getDeviceId() {
    const deviceId = localStorage.getItem("deviceId");
    if (deviceId) {
        return deviceId;
    } else {
        const min = 1;
        const max = 10000000;
        const deviceId = (Math.floor(Math.random() * (max - min + 1)) + min).toString();
        localStorage.setItem("deviceId", deviceId);
        return deviceId;
    }
}

async function getRandomVariant(test_id) {
    const url = HOST + "/tests/" + test_id + "/variant?" + "device_id=" + getDeviceId();

    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    };

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.status + " - " + response.statusText);
        }
        const responseData = await response.json();

        if (responseData.data) {
            return responseData.data.variant;
        } else {
            throw new Error("Response data format is not as expected");
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
}

async function setNewContent(selector, variant, variant_a, variant_b) {
    const element = document.querySelector(selector);
    if (element?.innerText == variant_a || element?.innerText == variant_b)
        element.innerText = variant;
}

async function runTests() {
    try {
        const tests = await getTests();

        await Promise.all(tests.map(async test => {
            const variant = await getRandomVariant(test.id);
            setNewContent(test.element_query_selector, variant, test.variations[0]?.variant_a, test.variations[0]?.variant_b);
            test.test_events.map(event => {
                if (event.event.type == "click")
                    runClickTest(test, event.event, variant == test.variations[0]?.variant_a ? "variant_a" : "variant_b");
                else
                    runViewTest(test, event.event, variant == test.variations[0]?.variant_a ? "variant_a" : "variant_b");
            });
        }));
    }
    catch (error) {
        console.log(error);
    }
}

async function getTests() {
    const url = HOST + "/tests" + "?domain_id=" + ${ domain_id } + "&path=" + window.location.origin + window.location.pathname;


    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    };

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.status + " - " + response.statusText);
        }
        const responseData = await response.json();

        if (responseData.data) {
            return responseData.data;
        } else {
            throw new Error("Response data format is not as expected");
        }

    } catch (error) {
        throw error;
    }
}

function runClickTest(test, event, variant) {
    const element = document.querySelector(event.element_query_selector);
    element.addEventListener("click", async () => {
        await updateEventStatistics(event.type, event.id, test.id, variant);
    });
}


async function updateEventStatistics(event_type, event_id, test_id, variant) {
    const lastRequestTime = parseInt(localStorage.getItem("lastStatisticsRequestTime" + event_id)) || 0;
    const currentTime = Date.now();
    if (currentTime - lastRequestTime >= 5000) {
        localStorage.setItem("lastStatisticsRequestTime" + event_id, currentTime.toString());

        const url = HOST + "/events/statistics";

        const body = JSON.stringify({
            type: event_type,
            event_id,
            test_id,
            variant
        });

        const requestOptions = {
            method: "PUT",
            body: body,
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const response = await fetch(url, requestOptions);
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.status + " - " + response.statusText);
            }
            const responseData = await response.json();

            if (responseData.data) {
                return responseData.data;
            } else {
                throw new Error("Response data format is not as expected");
            }
        } catch (err) {
            throw error;
        }
    }
}

async function runViewTest(test, event, variant) {
    if (document.referrer == test.page_url && (window.location.origin + window.location.pathname) == event.page_url) {
        try {
            await updateEventStatistics(event.type, event.id, test.id, variant);

            const responseData = await response.json();

            if (responseData.data) {
                return responseData.data;
            } else {
                throw new Error("Response data format is not as expected");
            }
        } catch (err) {
            throw error;
        }
    }
}

document.addEventListener("DOMContentLoaded", runTests);
