# CS3099 Project 

This is the repository for the CS3099 project.

## Running locally

To run this code locally, you must:

1. Run Mongod on an instance of the terminal
    ```
    > mongod
    ```
   Leave this terminal running while running system locally.
2. Make sure *.env* files exist in *.../frontend* and *.../backend* 
    
    Frontend *.env* file:
     
    ```
    PORT=5000
    REACT_APP_API_BASE=http://localhost:3000/api
    ```
    Backend *.env* file:
    ```
    PORT=3000
   DOMAIN="http://[::1]:3000"
   DB_PORT=27017 [change to port db is running on if not 27017]
   ```
3. Install any outstanding modules in *.../frontend* or *.../backend* by running
    ```
    npm install
   ```      
    in respective directories
4. Nagivate to *.../backend* and run:
    ```
    > npm run clean
    > npm run runClientAndServer
   ```

Site should now be accessible at *localhost:5000*
