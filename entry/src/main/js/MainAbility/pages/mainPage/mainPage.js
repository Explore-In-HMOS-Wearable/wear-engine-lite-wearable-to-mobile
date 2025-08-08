import { P2pClient, Message, Builder } from "../../wearengine/wearengine.js"
import app from '@system.app'
import { PHONE_APP_FINGERPRINT, PHONE_APP_PACKAGE_NAME } from '../../constants/constants.js';
import brightness from '@system.brightness';

var p2pClient = new P2pClient();
var MessageClient = new Message();
var builderClient = new Builder();

export default {
    data: {
        receiveMessage: '',
        receivedMessage: '',
        infoMessage: ''
    },
    onInit() {
        this.keepScreenOn(); // so that the screen doesn't turn off during the test
        p2pClient.setPeerPkgName(PHONE_APP_PACKAGE_NAME);
        p2pClient.setPeerFingerPrint(PHONE_APP_FINGERPRINT);
        this.registerMessage()
    },
    registerMessage() {
        var that = this;
        p2pClient.registerReceiver({
            onSuccess: function () {
                that.receiveMessage = "Message receive success";
            },
            onFailure: function () {
                that.receiveMessage = "Message receive fail";
            },
            onReceiveMessage: function (data) {
                if (data && data.isFileType) {
                    that.receiveMessage = "Receive file name:" + data.name;
                } else {
                    that.receiveMessage = "Receive message:" + data;
                    that.receivedMessage = data;
                    console.log('Received message: ' + that.receivedMessage);
                }
            },
        });
    },
    unregisterMessage() {
        var that = this;
        p2pClient.unregisterReceiver({
            onSuccess: function () {
                that.infoMessage = "Stop receiving messages is sent";
            },
        });
    },
    sendMessage() {
        builderClient.setDescription("hello wearEngine");
        MessageClient.builder = builderClient;
        this.infoMessage = "Send message button click";
        console.log("testBuilder" + MessageClient.getData());
        var that = this;
        p2pClient.send(MessageClient, {
            onSuccess: function () {
                that.infoMessage = "Message sent successfully";
            },
            onFailure: function () {
                that.infoMessage = "Failed to send message";
            },
            onSendResult: function (resultCode) {
                console.log("on send result " + resultCode.data + resultCode.code);
            },
            onSendProgress: function (progressNum) {
                console.log("Send Progress:" + progressNum);
            },
        });
    },

    keepScreenOn() {
        brightness.setKeepScreenOn({
            keepScreenOn: true,
            success: function () {
                // console.log('screen on success');
            },
            fail: function () {
                console.log('screen on failed');
            },
        })
        brightness.setValue({
            value: 180,
            success: function () {
                // console.log('handling set brightness success.');
            },
            fail: function (data, code) {
                console.error('handling set brightness value fail, code:' + code + ', data: ' + data);
            }
        });
    },

    sendFile() {
        this.infoMessage = "Send file button click";
        var testFile = {
            // File path. If the file fails to be sent and the result code is 208,
            // it indicates that the wearable version is too early. In this case, instruct users to update the version.
            "name" : "internal://app/rawfile/file.txt",
            "mode": "text",  // File type, 'text' or 'binary'
            "mode2": "RW",  // File attribute, "R", "W", or "RW"
        };
        // console.log("testBuilder" + MessageClient.getData());
        var that = this;

        builderClient.setPayload(testFile);
        MessageClient.builder = builderClient;
        p2pClient.send(MessageClient, {
            onSuccess: function () {
                that.infoMessage = "File sent successfully";
            },
            onFailure: function () {
                that.infoMessage = "Failed to send file";
            },
            onSendResult: function (resultCode) {
                console.log(resultCode.data + resultCode.code);
                if (resultCode.code === 207) {
                    that.infoMessage = "Success sent file"
                    return
                }
                that.infoMessage = resultCode.code;
            },
            onSendProgress: function (count) {
                console.log("Progress" + count);
                that.infoMessage = "Progress" + count;
            },
        });
    },
    ping() {
        var that = this;
        that.infoMessage = "Ping correct APP";
        p2pClient.ping({
            onSuccess: function () {
                that.infoMessage = that.infoMessage + "success";
            },
            onFailure: function () {
                that.infoMessage = that.infoMessage + "fail";
            },
            onPingResult: function (resultCode) {
                that.infoMessage = "result code:" + resultCode.code + ", the app already have installed";
            },
        });
    },
    swipeEvent(e) {
        if (e.direction == "right") {
            app.terminate();
        }
    }
}