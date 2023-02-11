# **IONiz Network**

> **WARNING!**<br/>These instructions are not accurate and may not be future-proof! Plus, they don't even work at this moment.

## **Introduction**

This is the backend for IONiz. (this will eventually probably be recoded in Rust or C++ for better speed)

You may use this according to the MIT license. Don't use this for bad pls.

> **Note:** In order to use this backend, you must have your clients add it by configuring it in the app settings.

---

## **Setup**

This backend is the part of IONiz, which handles IONiz accounts and proxying to different servers. 

**You do not need to create a new account in this system to make use of it! You can configure it in such a way that IONiz automatically considers it as an extension, rather than as a replacement for the backend as a whole. Simply have this entry in the config:**
```json
{
    "network_settings": {
        "use_as_extension": true
    }
}
```
**By default, this will practically be useless. You can further configure it to allow you to host files and etc. Example:**
```json
{
    "network_settings": {
        "use_as_extension": true,
        "extension_settings": {
            "file_host": true,
            "proxy": true,
            "groups": true
        }
    }
}
```
> **Note:** `extension_settings` is only taken into account if you have `use_as_extension` set to `true`!

> **<h2>Meaning of the extension settings:</h2>**`"file_host": true`<br/>**Allows file hosting on the backend.**<br/><br/>`"proxy": true`<br/>**Allows proxying honeycomb connections, so honeycomb hosts cannot see your IP address.**<br/><br/>`"groups": true`<br/>**Allows making IONiz groups.**

> **Requirements:**<br/>- HTTPS connection<br/>- Port-forwarded accessible URL for the server<br/>- NodeJS, ideally latest or at least LTS<br/>- A working PostgreSQL database

---

## **How to run:**
- Simply make sure all dependencies are installed. If you have yarn, just do `yarn`, if you use NPM, do `npm install`.
- Now run `yarn start` (for yarn) or `npm start` (for NPM). You can also add the `--debug` flag for debugging like so: `yarn start --debug` or `npm start --debug`. `-d`, `-debug` and `--d` also work.
- You should be up and running, so long as everything is configured and set up correctly.

---

## **Note:**

### Documentation is not yet available, but will be available later at https://docs.thered.sh/IONiz! <br/><br/>**Please be patient!**