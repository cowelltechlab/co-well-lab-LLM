import time
import sys

def retry_generation(
    generation_fn,
    validator_fn,
    args=(),
    kwargs=None,
    retries=2,
    delay=1,
    debug_label=None
):
    if kwargs is None:
        kwargs = {}

    for attempt in range(1, retries + 2):  # includes initial try
        try:
            result = generation_fn(*args, **kwargs)

            if validator_fn(result):
                if debug_label:
                    print(f"[{debug_label}] Success on attempt {attempt}")
                    sys.stdout.flush()
                return result
            else:
                print(f"[{debug_label}] Validation failed on attempt {attempt}")
        except Exception as e:
            print(f"[{debug_label}] Exception on attempt {attempt}: {e}")

        time.sleep(delay)

    print(f"[{debug_label}] All {retries + 1} attempts failed.")
    return None
