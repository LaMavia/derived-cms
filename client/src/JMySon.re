type response = {id: string};

type reg_user = {
  username: string,
  email: string,
  password: string,
  repeat_password: string,
};

type log_user = {
  username: string,
  password: string,
};

module Decode = {
  let response = json => Json.Decode.{id: json |> field("id", string)};
};

module Encode = {
  let reg_user = (~username, ~email, ~password, ~repeat_password) =>
    Json.Encode.(
      object_([
        ("username", username |> string),
        ("email", email |> string),
        ("password", password |> string),
        ("repeat_password", repeat_password |> string),
      ])
    );

  let log_user = (~username, ~password) =>
    Json.Encode.(
      object_([
        ("username", username |> string),
        ("password", password |> string),
      ])
    );
};