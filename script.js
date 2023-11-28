const HOST = "https://api.keak.com";

function getDeviceId() {
  const deviceId = localStorage.getItem("deviceId");
  if (deviceId) {
    return deviceId;
  } else {
    const min = 1;
    const max = 10000000;
    const deviceId = (
      Math.floor(Math.random() * (max - min + 1)) + min
    ).toString();
    localStorage.setItem("deviceId", deviceId);
    return deviceId;
  }
}

async function getRandomVariant(test_id) {
  const url =
    HOST + "/tests/" + test_id + "/variant?" + "device_id=" + getDeviceId();

  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(
        "Network response was not ok: " +
          response.status +
          " - " +
          response.statusText
      );
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
  if (element?.innerText?.length > 0 && variant.length > 0) {
    if (variant[0] === '"' && variant[variant.length - 1] === '"') {
      let text = variant.substring(1, variant.length - 1);
      element.innerText = text;
    } else {
      element.innerText = variant;
    }
  }
}

async function runTests() {
  try {
    const tests = await getTests();

    await Promise.all(
      tests.map(async (test) => {
        const variant = await getRandomVariant(test.id);
        setNewContent(
          test.element_query_selector,
          variant,
          test.variations[0]?.variant_a,
          test.variations[0]?.variant_b
        );
        test.test_events.map((event) => {
          if (
            removeLastSlashFromUrl(
              window.location.origin + window.location.pathname
            ) !== removeLastSlashFromUrl(event.event.page_url)
          ) {
            const timestamp = new Date().getTime(); // current time
            const exp = timestamp + 60 * 60 * 24 * 1000 * 7;
            document.cookie =
              "lastVariantSeen=" +
              variant +
              "; expires=" +
              new Date(exp).toUTCString() +
              ";";
          }
          if (event.event.type == "click") {
            runClickTest(
              test,
              event.event,
              variant == test.variations[0]?.variant_a
                ? "variant_a"
                : "variant_b"
            );
          } else {
            const regex = new RegExp("(^| )lastVariantSeen=([^;]+)");
            const match = document.cookie.match(regex);
            if (match) {
              let lastVariantSeen = match[2];
              if (lastVariantSeen) {
                runViewTest(
                  test,
                  event.event,
                  lastVariantSeen == test.variations[0]?.variant_a
                    ? "variant_a"
                    : "variant_b"
                );
              }
            }
          }
        });
      })
    );
  } catch (error) {
    console.log(error);
  }
}

const removeLastSlashFromUrl = (url) => {
  if (url[url.length - 1] === "/") {
    return url.substring(0, url.length - 1);
  }
  return url;
};

async function getTests() {
  const url =
    HOST +
    "/tests" +
    "?domain_id=" +
    domain_id + // domain_id is defined in the template
    "&path=" +
    removeLastSlashFromUrl(window.location.origin + window.location.pathname);

  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(
        "Network response was not ok: " +
          response.status +
          " - " +
          response.statusText
      );
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
  const lastRequestTime =
    parseInt(localStorage.getItem("lastStatisticsRequestTime" + event_id)) || 0;
  const currentTime = Date.now();
  if (currentTime - lastRequestTime >= 5000) {
    localStorage.setItem(
      "lastStatisticsRequestTime" + event_id,
      currentTime.toString()
    );

    const url = HOST + "/events/statistics";

    const body = JSON.stringify({
      type: event_type,
      event_id,
      test_id,
      variant,
    });

    const requestOptions = {
      method: "PUT",
      body: body,
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error(
          "Network response was not ok: " +
            response.status +
            " - " +
            response.statusText
        );
      }
      const responseData = await response.json();

      if (responseData.data) {
        return responseData.data;
      } else {
        throw new Error("Response data format is not as expected");
      }
    } catch (err) {
      throw err;
    }
  }
}

async function runViewTest(test, event, variant) {
  if (
    removeLastSlashFromUrl(window.location.origin + window.location.pathname) ==
    removeLastSlashFromUrl(event.page_url)
  ) {
    try {
      let response = await updateEventStatistics(
        event.type,
        event.id,
        test.id,
        variant
      );
      if (response) {
        return response;
      }
    } catch (err) {
      throw err;
    }
  }
}

document.addEventListener("DOMContentLoaded", runTests);
