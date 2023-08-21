"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpTypes = exports.RoleType = void 0;
var RoleType;
(function (RoleType) {
    RoleType["USER"] = "user";
    RoleType["ADMIN"] = "admin";
})(RoleType || (exports.RoleType = RoleType = {}));
var OtpTypes;
(function (OtpTypes) {
    OtpTypes["FORGET"] = "forget";
    OtpTypes["VERIFICATION"] = "verification";
    OtpTypes["AUTHENTICATION"] = "authentication";
})(OtpTypes || (exports.OtpTypes = OtpTypes = {}));
