[![Laravel Forge Site Deployment Status](https://img.shields.io/endpoint?url=https%3A%2F%2Fforge.laravel.com%2Fsite-badges%2F3a6bceca-0c4e-45a3-97cc-f9a656c1ba1e%3Fdate%3D1%26commit%3D1&style=plastic)](https://forge.laravel.com/servers/515495/sites/2081940)

## Hosted instance

[https://einundzwanzigstr.codingarena.de](https://einundzwanzigstr.codingarena.de)

## Vision

Connect Einundzwanzig Portal data with the nost network.

## Features

- [ ] real-time notifications
- [ ] image proxy
- [ ] better error handling
    - [ ] frontend notifications
- [ ] never ending bugfixes
    - [ ] prevent re-rendering of posts (flickering)
- [x] NIP-01
    - [ ] user profile
    - [ ] user profile settings
    - [ ] more meta info on all author components
        - [ ] follow status
        - [ ] NIP-05 validation
    - [x] fetch author metadata
    - [ ] reply
        - [ ] better nested replies
    - [ ] Einundzwanzig Meetups overview (map)
    - [ ] save npub for Einundzwanzig Meetup
- [ ] NIP-02 Contact List and Petnames
    - [ ] follow/unfollow
    - [ ] follow statistics
- [ ] NIP-04 DMs
- [ ] NIP-09 Event Deletion
- [ ] NIP-23 Long-form Content
- [x] NIP-25 Reactions
- [x] NIP-18: Repost
- [x] NIP-57: Zaps
    - [x] LUD06
    - [x] LUD16
- technical stuff
    - [ ] better relay connections
    - [x] cache
        - [x] redis
        - [x] dexie cache
        - [ ] optimize cache
    - [x] signing
        - [x] NIP-07
        - [ ] nsec bunker
        - [ ] Nostr Connect

## Development

### Installation

```cp .env.example .env```

```
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v $(pwd):/var/www/html \
    -w /var/www/html \
    laravelsail/php81-composer:latest \
    composer install --ignore-platform-reqs
```

*(you need a valid Laravel Nova license)*

#### Start docker development containers

```vendor/bin/sail up -d```

### Laravel storage link

```./vendor/bin/sail artisan storage:link```

#### Install node dependencies

```vendor/bin/sail yarn install```

#### Start just in time compiler

```vendor/bin/sail yarn dev```

#### Update dependencies

```vendor/bin/sail yarn```

## Contributing

WIP

## Security Vulnerabilities

If you discover a security vulnerability within this project, please send an e-mail to Benjamin Takats
via [fsociety.mkv@pm.me](mailto:fsociety.mkv@pm.me). All security vulnerabilities will be promptly addressed.

## License

Open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
