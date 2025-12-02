from pathlib import Path

from sklearn.compose import _column_transformer
import joblib


class _RemainderColsList(list):
    """Stub so models trained on sklearn<1.7 can be loaded."""


if not hasattr(_column_transformer, "_RemainderColsList"):
    _column_transformer._RemainderColsList = _RemainderColsList  # type: ignore[attr-defined]

MODEL_PATH = Path('server/models/multi_output_model.pkl')
model = joblib.load(MODEL_PATH)

print('Loaded model type:', type(model))

feature_names = getattr(model, 'feature_names_in_', None)
if feature_names is not None:
    print('Feature names:', feature_names)
else:
    print('No feature_names_in_ attribute. Checking nested pipeline...')
    # Try to dig into pipeline
    if hasattr(model, 'named_steps'):
        for name, step in model.named_steps.items():
            inner_features = getattr(step, 'feature_names_in_', None)
            if inner_features is not None:
                print(f'Feature names available on step {name}:', inner_features)

output_names = getattr(model, 'output_names_', None)
print('Output names:', output_names)

if hasattr(model, 'estimators_'):
    print('Number of estimators:', len(model.estimators_))

try:
    import json
    metadata = {
        'n_features_in': getattr(model, 'n_features_in_', None),
        'n_outputs': getattr(model, 'n_outputs_', None),
    }
    print('Metadata JSON:', json.dumps(metadata, indent=2, default=str))
except Exception as exc:  # pragma: no cover
    print('Failed to serialize metadata:', exc)
