# Notifications

Overseerr already supports a good number of notification agents, such as **Discord**, **Slack** and **Pushover**. New agents are always considered for development, if there is enough demand for it.

## Supported Notification Agents

- [Email](./email.md)
- [Discord](./discord.md)
- [Pushbullet](./pushbullet.md)
- [Pushover](./pushover.md)
- [Slack](./slack.md)
- [Telegram](./telegram.md)
- [Webhooks](./webhooks.md)

## Setting Up Notifications

Configuring your notifications is quite simple. First, you will need to visit the **Settings** page and click **Notifications** in the menu. This will present you with all of the currently available notification agents. Click on each one individually to configure them.

You must configure which type of notifications you want to send _per agent_. If no types are selected, you will not receive notifications!

Note that some notifications are intended for the user who submitted the relevant request, while others are for administrators. For details, please see the documentation for the specific agent you would like to use.

## Requesting New Notification Agents

If we do not currently support a notification agent you would like, feel free to request it on [GitHub](https://github.com/sct/overseerr/issues). However, please be sure to search first and confirm that there is not already an existing request for the agent!
