Heartbeat
=========

Heartbeat is a simple way to check a process's vital signs.  Use it instead of Monit, Pingdom, Uptime Robot, or any combination thereof.

It's intended to be used in simple applications where full-scale process monitoring is overkill.

# Usage

Making a new Heartbeat is easy.  Just open up a terminal and type:

    curl http://heartbeat.alexose.com/your-email@example.com/60

This will create a new heartbeat that will alert "your-email@example.com" in 60 seconds.  You can postpone this alert by running the same command again, or you can stop it altogether by sending a cancellation:

    curl http://heartbeat.alexose.com/your-email@example.com/cancel

Heartbeat handles these nonstandard URLs and does not require them to be encoded in any special way.

# Examples

It's often useful to know whether a machine has lost power or internet connectivity.  An easy to monitor this might be to add a Heartbeat to your crontab.  From the terminal, type:

    (crontab -l ; echo "* * * * * curl http://heartbeat.alexose.com/your-email@example.com/120") |   crontab -

This updates the Heartbeat every 60 seconds.  If it fails to update, you'll receive an alert after 120 seconds.

# Advanced

Note that each request is tracked by a combination of your IP and User-Agent, so there's no need for unique IDs or tags.  If you need multiple heartbeats, simply use a different User-Agent:

    curl -A "process one" http://heartbeat.alexose.com/your-email@example.com/60
    curl -A "process two" http://heartbeat.alexose.com/your-email@example.com/60

Heartbeat can also alert you if a particular value is out of range:

    curl http://heartbeat.alexose.com/your-email@example.com/60/70/60/80  # in range
    curl http://heartbeat.alexose.com/your-email@example.com/60/72        # in range
    curl http://heartbeat.alexose.com/your-email@example.com/60/57        # out of range

# Installation

If you'd like to run it on your own machine, just npm checkout heartbeat-server.

    npm install heartbeat-server
    node heartbeat-server app.js [port]

# Security

There is none.

# Redundancy

Nope!

# Rate Limiting

By default, each IP is only allowed to send 20 alerts per day.
