// Generated by BUCKLESCRIPT VERSION 5.0.4, PLEASE EDIT WITH CARE
'use strict';

var Json = require("@glennsl/bs-json/src/Json.bs.js");
var Fetch = require("bs-fetch/src/Fetch.js");
var React = require("react");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Json_decode = require("@glennsl/bs-json/src/Json_decode.bs.js");
var Json_encode = require("@glennsl/bs-json/src/Json_encode.bs.js");
var AuthLayout$ReactHooksTemplate = require("../components/AuthLayout.bs.js");

function response(json) {
  return /* record */[
          /* token */Json_decode.field("token", Json_decode.string, json),
          /* username */Json_decode.field("username", Json_decode.string, json)
        ];
}

var Decode = /* module */[/* response */response];

function user(username, password) {
  return Json_encode.object_(/* :: */[
              /* tuple */[
                "username",
                username
              ],
              /* :: */[
                /* tuple */[
                  "password",
                  password
                ],
                /* [] */0
              ]
            ]);
}

var Encode = /* module */[/* user */user];

function Pages__Signin(Props) {
  return React.createElement(AuthLayout$ReactHooksTemplate.make, {
              title: "signin",
              children: null,
              onSubmit: (function (e) {
                  var username = e.currentTarget.username.value;
                  var password = e.currentTarget.password.value;
                  fetch(window.location.origin + "/auth/signup", Fetch.RequestInit[/* make */0](/* Post */2, undefined, Caml_option.some(Json.stringify(user(username, password))), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)(/* () */0)).then((function (prim) {
                          return prim.json();
                        }));
                  return /* () */0;
                }),
              btnValue: "Signin"
            }, React.createElement("input", {
                  className: "auth__form__input",
                  id: "username",
                  name: "username",
                  placeholder: "username",
                  type: "text"
                }), React.createElement("input", {
                  className: "auth__form__input",
                  id: "password",
                  name: "password",
                  placeholder: "password",
                  type: "password"
                }));
}

var make = Pages__Signin;

exports.Decode = Decode;
exports.Encode = Encode;
exports.make = make;
/* react Not a pure module */