from sklearn.compose import _column_transformer

if not hasattr(_column_transformer, "_RemainderColsList"):
    exec(
        "class _RemainderColsList(list):\n    pass\n",
        _column_transformer.__dict__,
    )

import joblib

model = joblib.load('server/models/multi_output_model.pkl')
print('Loaded pipeline:', type(model), 'with', getattr(model, 'n_features_in_', 'unknown'), 'features')
print('Feature names:', getattr(model, 'feature_names_in_', None))
print('Outputs:', getattr(model, 'output_names_', None))
