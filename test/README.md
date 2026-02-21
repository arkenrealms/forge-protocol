# arken/forge/protocol/test

Jest coverage for Forge protocol local router behavior, including schema validation/normalization, Unicode NFC canonical normalization, input size-limit guardrails, pre-trim control/format-character input rejection (including leading/trailing controls, C1 Unicode control bytes, and zero-width format chars), stable error-shape handling for non-Error throwables from sync handlers (with original throwable preserved in `Error.cause`), and missing-handler diagnostics that include the received runtime type.
