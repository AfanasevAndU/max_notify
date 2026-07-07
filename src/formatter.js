function formatTime(date = new Date()) {
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "short",
        timeStyle: "medium"
    }).format(date);
}

export function formatMessage(payload) {
    if (payload.text) {
        return payload.text;
    }

    const {
        status = "info",
        dag = "-",
        task = "-",
        owner,
        duration,
        environment,
        error,
        time
    } = payload;

    const statusMap = {
        success: {
            icon: "✅",
            title: "AIRFLOW SUCCESS"
        },
        failed: {
            icon: "❌",
            title: "AIRFLOW FAILED"
        },
        running: {
            icon: "🚀",
            title: "AIRFLOW RUNNING"
        },
        warning: {
            icon: "⚠️",
            title: "AIRFLOW WARNING"
        },
        info: {
            icon: "ℹ️",
            title: "AIRFLOW INFO"
        }
    };

    const current = statusMap[status] ?? statusMap.info;

    const lines = [];

    lines.push(`${current.icon} ${current.title}`);
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━");
    lines.push("");

    lines.push(`📦 DAG: ${dag}`);
    lines.push(`⚙️ Task: ${task}`);

    if (owner)
        lines.push(`👤 Owner: ${owner}`);

    if (environment)
        lines.push(`🌍 Environment: ${environment}`);

    if (duration)
        lines.push(`⏱ Duration: ${duration}`);

    if (error) {
        lines.push("");
        lines.push("💥 Error:");
        lines.push(error);
    }

    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━");
    lines.push(`🕒 ${time ?? formatTime()}`);

    return lines.join("\n");
}