const { Message, ChatInputCommandInteraction } = require("discord.js");
const Computer = require("./Computer");
const Katheryne = require("./Katheryne");
const Language = require("./Language");
const pty = require("node-pty");

class ExecSession {
    /**
     * @param {Message|ChatInputCommandInteraction} message Discord message or interaction object
     * @param {string} command Execute command
     */
    constructor(message, command, author) {
        this.message = message;
        this.command = command;
        this.author = author;
        this.process = null;
        this.collector = null;
        this.interactive = false;
        this.interval = null;
        this.timestamp = 0;
    }
    /**
     * Execute the command.
     * @returns Spawned process object
     */
    execute() {
        if (this.process) return;
        this.process = pty.spawn("bash", ["-c", "--", this.command], {
            name: "xterm",
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        });
        this.setStdoutEvent();
        this.setCloseEvent();
        if (this.interactive) this.setInteractiveEvent();
        this.updateTimestamp();
        this.setWaitTimeout();
        return this.process;
    }
    /**
     * Set the stdout event.
     */
    setStdoutEvent() {
        this.process.onData((function(data) {
            this.updateTimestamp();
            Katheryne.addLog(this.message, data);
        }).bind(this));
    }
    /**
     * Set the close event.
     */
    setCloseEvent() {
        this.process.onExit((function(data) {
            clearInterval(this.interval);
            this.interval = null;
            Katheryne.addLog(this.message, Language.strings.logs.processExit.format(data.exitCode.toString()));
            this.process = null;
        }).bind(this));
    }
    /**
     * Set the interactive event
     */
    setInteractiveEvent() {
        var channel = this.message.channel,
            filter = (function(message) {
                return (message.author.id == this.author.id);
            }).bind(this),
        collector = this.collector = channel.createMessageCollector({filter});
        collector.on("collect", (function(message) {
            if (message.content.toLowerCase() == "cancel") {
                message.delete();
                collector.stop();
                this.exit();
                return;
            }
            var content = message.content;
            message.delete();
            this.write(content);
        }).bind(this));
    }
    /**
     * Set the command wait timeout.
     */
    setWaitTimeout() {
        this.interval = setInterval((function() {
            if (new Date().getTime() >= this.timestamp) {
                Katheryne.addLog(this.message, Language.strings.exec.timeout);
                this.exit();
            }
        }).bind(this), 1000);
    }
    /**
     * Update the last interact timestamp.
     */
    updateTimestamp() {
        this.timestamp = new Date().getTime() + 30000;
    }
    /**
     * Write a string to the process stdin.
     * @param {string} content The stdin content
     */
    write(content) {
        this.updateTimestamp();
        if (this.process) this.process.write(`${content}\r`);
    }
    /**
     * Exit the process.
     */
    exit() {
        if (this.process) Computer.exec(`pkill -P ${this.process.pid}`);
    }
}

module.exports = ExecSession;