# Code Overview :computer:

This code is a JavaScript implementation for running A/B tests on a web page and tracking user interactions. It allows you to serve different variants of content to users and record statistics about how they interact with the variations. 

🔗 **Code Organization**

The code is structured into functions and event listeners that are triggered at various points in the user's interaction with the web page. 

🛠️ **Functions**

1. `getDeviceId()`: Retrieves or generates a unique device ID and stores it in local storage.

2. `getRandomVariant(test_id)`: Fetches a random test variant from a remote server using the device ID.

3. `setNewContent(selector, variant, variant_a, variant_b)`: Updates the content of an HTML element specified by a selector with a new variant.

4. `runTests()`: Orchestrates the A/B testing process. It fetches tests, selects variants, and tracks user interactions.

5. `getTests()`: Retrieves the available tests for the current page from the remote server.

6. `runClickTest(test, event, variant)`: Listens for click events on specified elements and updates event statistics.

7. `updateEventStatistics(event_type, event_id, test_id, variant)`: Sends statistics about user interactions to the server.

8. `runViewTest(test, event, variant)`: Handles view events and sends event statistics to the server.

9. Event listener: The script starts running the tests when the DOM content is fully loaded.

📡 **API Integration**

The code interacts with a remote API hosted at `https://api.keak.com`. It uses this API to fetch tests, variants, and record event statistics.

## How to Use :rocket:

1. Include this JavaScript file in your web project.

2. Ensure the `HOST` variable is set to the correct API endpoint.

3. Implement server-side logic to define A/B tests and their variations on the backend. These tests should be accessible via the API.

4. Add test-specific data attributes to your HTML elements that you want to vary based on A/B tests. Define these data attributes in your server-side code.

5. In the code, specify the element selectors, variant IDs, and event types that should trigger A/B testing.

6. Customize the statistics update frequency (currently set to 5000 milliseconds) in the `updateEventStatistics` function as needed.

🤝 **Contributing**

Contributions to this project are welcome! To contribute:

1. Fork the repository.

2. Make your changes and improvements.

3. Create a pull request with a clear description of your changes.

4. Be sure to follow best practices and maintain code quality.

5. Provide appropriate documentation and comments for your changes.

6. Collaborate with the community for code review and improvements.

📜 **License**

This code is available under an open-source license (provide license details), so feel free to use it in your projects and adapt it as needed.

Happy coding! :tada:
