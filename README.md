Heartbeat
=========

Heartbeat is an EKG for your remote process.  It lets you know if it's dying.

It's intended to be used in simple applications where full-scale process monitoring is overkill.

# Installation

    npm install heartbeat-server
    node heartbeat-server app.js [port]

# Usage

Making a Heartbeat request is easy:

    curl http://server/email/[time]/[value]/[minimum]/[maximum]

For example,

    curl http://hearbeat.server/alex@alexose.com/30

Once recieved, this will alert alex@alexose.com in 30 seconds, unless one of the two following requests are made:

    curl http://heartbeat.server/alex@alexose.com/30

or

    curl http://heartbeat.server/alex@alexose.com/30/cancel

Heartbeat handles these nonstandard URLs, and does not require them to be encoded.  You may URLencode these parameters if you wish (for compatibility reasons!), but it isn't necessary.

# Advanced

Note that each request is tracked by a combination of your IP and User-Agent, so there's no need for unique IDs or tags.  If you need multiple heartbeats, simply use a different User-Agent:

    curl -A "process one" http://hearbeat.server/alex@alexose.com/30
    curl -A "process two" http://hearbeat.server/alex@alexose.com/30

Heartbeat can also alert you if a particular value is out of range:

    curl http://heartbeat.server/alex@alexose.com/30/55/60/80

# Security

There is none.

# Redundancy
