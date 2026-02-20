# arken/forge/protocol/test

Jest coverage for Forge protocol local router behavior, including schema validation/normalization, input size-limit guardrails, pre-trim control-character input rejection (including leading/trailing control bytes), and stable error-shape handling for non-Error throwables from sync handlers (with original throwable preserved in `Error.cause`).
