type auth_response = {id: string};

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

type response('dtype) = {
  data: 'dtype,
  error: string,
  ok: bool,
};

type collection_stats = {
  count: int,
  size: (float, string),
};

type labels = array(string);
type labels_response = response(labels);

type overview_state = {
  stats: collection_stats,
  collection: string,
  schema: array((string, string)),
};

type overview_response = response(overview_state);

module Decode = {
  let auth_response = json => Json.Decode.{id: json |> field("id", string)};
  let collection_stats = json =>
    Json.Decode.{
      count: json |> field("count", int),
      size: json |> field("size", pair(float, string)),
    };
  let overview_state = json =>
    Json.Decode.{
      stats: json |> field("stats", collection_stats),
      collection: json |> field("collection", string),
      schema: json |> field("schema", array(pair(string, string))),
    };

  let labels_response = json =>
    Json.Decode.{
      data: json |> field("data", array(string)),
      error: json |> field("error", string),
      ok: json |> field("ok", bool),
    };

  let overview_response = json =>
    Json.Decode.{
      data: json |> field("data", overview_state),
      error: json |> field("error", string),
      ok: json |> field("ok", bool),
    };
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