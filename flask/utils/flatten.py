def flatten_dict(d, parent_key="", sep="_"):
    """
    Recursively flattens nested dictionaries.
    Example:
    {'a': {'b': 1}} → {'a_b': 1}
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)
