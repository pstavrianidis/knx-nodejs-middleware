# KNX - NodeJS Application Middleware

A NodeJS middleware application capable of talking multicast (routing) and unicast (tunneling) to a KNX system through a REST API.

## Installation

1. Clone this repo.

2. Optionally, edit the configuration.

    ```shell
    cp example.env .env
    <edit .env>
    ```
    If `.env` is absent, default values will be used.

3. Install npm modules and run the program.

    ```shell
    npm install ## to install dependencies
    npm start ## Begin the server
    ```

## Usage

```Javascript
Post request:
endpoint: "/middleware-knx-switch",
parameters: "ip", "device", "value" // '172.0.0.1' '0/0/1' , 0/1

```
