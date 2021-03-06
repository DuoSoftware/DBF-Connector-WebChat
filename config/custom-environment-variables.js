module.exports = {
    "Redis": {
        "mode": "SYS_REDIS_MODE",
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD",
        "sentinels": {
            "hosts": "SYS_REDIS_SENTINEL_HOSTS",
            "port": "SYS_REDIS_SENTINEL_PORT",
            "name": "SYS_REDIS_SENTINEL_NAME"
        }
    },
    "Security": {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD",
        "mode": "SYS_REDIS_MODE",
        "sentinels": {
            "hosts": "SYS_REDIS_SENTINEL_HOSTS",
            "port": "SYS_REDIS_SENTINEL_PORT",
            "name": "SYS_REDIS_SENTINEL_NAME"
        }
    },
    "Host": {
        "vdomain": "LB_FRONTEND",
        "domain": "HOST_NAME",
        "port": "HOST_PORT",
        "version": "HOST_VERSION"
    },
    "LBServer": {
        "ip": "LB_FRONTEND",
        "port": "LB_PORT"
    },
    "Services": {
        "accessToken": "GLOBAL_TOKEN",
        "dispatcherAPIkey": "DISPATCHER_API_KEY",
        "dispatchServiceProtocol": "DISPATCHER_PROTOCOL",
        "dispatchServiceHost": "DISPATCHER_HOST",
        "dispatchServicePort": "DISPATCHER_PORT",
        "dispatchServiceVersion": "DISPATCHER_VERSION",
        "botServiceProtocol": "BOT_SERVICE_PROTOCOL",
        "botServiceHost": "BOT_SERVICE_HOST",
        "platformServiceHost": "PLATFORM_SERVICE_HOST"
    },
    "Mongo": {
        "ip": "SYS_MONGO_HOST",
        "port": "SYS_MONGO_PORT",
        "dbname": "SYS_MONGO_DB",
        "password": "SYS_MONGO_PASSWORD",
        "user": "SYS_MONGO_USER",
        "replicaset": "SYS_MONGO_REPLICASETNAME",
        "cloudAtlas": "SYS_MONGO_CLOUDATLAS"
    },
    "Google": { // dev
        "translate": "TRANSLATE_KEY"
    }
};
//NODE_CONFIG_DIR