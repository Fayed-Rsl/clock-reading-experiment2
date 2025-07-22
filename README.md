# Clock reading speed experiment

## Project Description

This silly but fun project is a web-based application designed to measure and compare users' clock reading speed and accuracy, specifically for analog and digital clocks. Users can participate in an experiment, input their readings, and then view their individual results as well as compare their performance against community-wide statistics.

Try it here: https://clock-reading.onrender.com/ (might take few seconds before loading).

## Features

* **Experiment Modes:**
    * **Digital Clock:** Test your speed and accuracy in reading digital time.
    * **Analog Clock:** Practice reading analog clocks.
    * **Analog Clock with/without Numbers:** Option to customize the analog clock display to include or exclude numbers, allowing for different levels of challenge.
* **Performance Tracking:** Records reaction time, accuracy, and detailed trial data for each experiment.
* **User Statistics:** Provides a summary of the user's performance, including overall accuracy and average reaction times for different clock types.
* **Community Comparison:** Fetches and displays anonymized community statistics, allowing users to see how their performance stacks up against others.
* **Persistent Data Storage:** All experiment data and summary results are securely stored in a database.
* **Intuitive User Interface:** A clean and responsive design for an engaging experience.

## Technologies Used

### Frontend
* **HTML5:** Structure of the web application.
* **CSS3:** Styling and layout, including responsive design.
* **JavaScript:** Core logic for the experiment, user interaction, data handling, and dynamic content updates.

### Backend
* **Node.js:** JavaScript runtime environment for the server-side application.
* **Express.js:** Fast, unopinionated, minimalist web framework for Node.js, used for API endpoints.
* **SQLiteCloud:** Cloud-based SQLite database service for data storage.
* **`@sqlitecloud/drivers`:** Node.js driver for interacting with SQLiteCloud.

## Setup and Installation

To set up and run this project locally, follow these steps:

### Prerequisites

* Node.js
* A SQLiteCloud account and connection string (including API Key, Host, Port, Database Name).

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd clock-reading-experiment # or your project folder name
    ```
2.  Replace in server.js with your actual SQLiteCloud credentials.:
    ```
    const connectionString = process.env.SQLITECLOUD_CONNECTION_STRING || "sqlitecloud://id.sqlite.cloud:8860/apikey...";

    // SQLiteCloud client configuration
    // The 'Database' constructor itself initializes the connection or makes it ready for operations.
    // There is no explicit .connect() method to call.
    const db = new Database(connectionString,
        {
        host: process.env.SQLITECLOUD_HOST || 'id.sqlite.cloud',
        username: process.env.SQLITECLOUD_USER || 'admin',
        port: process.env.SQLITECLOUD_PORT || 8860,
        database: process.env.SQLITECLOUD_DB || 'clockdb',
        apikey: process.env.SQLITECLOUD_APIKEY || 'apikey...',
        ssl: true // Use SSL for secure connection
    });

    ```

3.  **Install backend dependencies:**
    ```bash
    npm install
    ```
4.  **Start the backend server:**
    ```bash
    node server.js
    ```
    The server will typically run on `http://localhost:8080`. The database tables (`users`, `experiments`, `trials`) will be automatically created if they don't exist.

### Frontend Setup

The frontend is a static HTML file (`index.html`) that directly interacts with the backend.

1.  **Open `index.html`:**
    Simply open the `index.html` file in your web browser. You can do this by navigating to the file path (e.g., `file:///path/to/your/project/public/index.html`) or by using a simple static file server (like `serve` or a Live Server extension in VS Code) if you wish to run it via `http://`.

    * **Important:** Ensure your `server.js` is running before attempting to use the frontend, as it makes API calls to the backend. If you change the default port (8080) in `server.js`, you'll need to update the `fetch` calls in `index.html` accordingly (e.g., `/api/save-experiment` becomes `http://localhost:YOUR_NEW_PORT/api/save-experiment`).

## Usage

1.  **Start the Experiment:**
    * Upon opening `index.html`, you'll be prompted to choose a clock type (Digital, Analog, Mixed).
    * For Analog clocks, you can also decide whether to show numbers.
    * Enter a username (optional) to save your results and participate in community statistics.
    * Click "Start Experiment".

2.  **Participate in Trials:**
    * A clock will be displayed.
    * Enter the time shown on the clock in the input field.
    * Press `Enter` or click "Submit Time".
    * The experiment will progress through a series of trials.

3.  **View Results:**
    * After completing all trials, your individual results will be displayed, including overall accuracy and average reaction times.
    * You'll also see how your performance compares to community averages.

4.  **Restart:**
    * Click "Restart Experiment" to begin a new session.

## License

This project is open source and available under the [MIT License](LICENSE).