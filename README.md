# KNX Node Server

A knx middleware node server for send command in knx protocol!

## Installation

1. Clone this repo.

2. Optionally, edit the configuration.

    ```shell
    cp config-example.json config.json
    <edit config.json>
    ```
    If `config.json` is absent, default values will be used.

3. Install npm modules and run the program.

    ```shell
    npm install ## to install dependencies
    npm start ## Begin the server
    ```

## Usage

```Javascript
Post request:
endpoint: "/middleware-knx-command",
parameters: "device", "value" // '0/0/1' , 0/1

```
