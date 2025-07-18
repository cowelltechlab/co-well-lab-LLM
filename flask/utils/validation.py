def is_valid_string_output(data):
    return isinstance(data, str) and len(data.strip()) > 20  # or some reasonable minimum
