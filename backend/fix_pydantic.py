"""Script to update Pydantic v1 models to v2 syntax."""
import re
from pathlib import Path

models_dir = Path("backend/app/models")
schemas_dir = Path("backend/app/schemas")

def fix_file(path):
    text = path.read_text(encoding='utf-8')

    # Replace imports
    text = text.replace("from pydantic import BaseModel, Field, validator", "from pydantic import BaseModel, Field, field_validator")
    text = text.replace("from pydantic import BaseModel, Field", "from pydantic import BaseModel, Field, field_validator")
    
    # Replace @validator with @field_validator
    text = text.replace("@validator(", "@field_validator(")
    
    # Add @classmethod decorator to validators if missing
    text = re.sub(r'(@field_validator\([^\)]+\))\s+def', r'\1\n    @classmethod\n    def', text)
    
    # Replace Config class
    old_config = """    class Config:
        allow_population_by_field_name = True"""
    new_config = """    model_config = ConfigDict(
        populate_by_name=True"""
    text = text.replace(old_config, new_config)
    
    # Add closing brace if json_encoders/schema_extra exist
    if 'json_encoders = {' in text:
        text = text.replace('json_encoders = {', 'json_encoders={\n            ', 1)
        text = text.replace('}\n        schema_extra = {', '},\n        json_schema_extra={')
        # Fix indentation
        text = text.replace('datetime: lambda v: v.isoformat() if v else None', 'datetime: lambda v: v.isoformat() if v else None')
        # Ensure proper closing
        text = re.sub(r'(\s+)json_encoders=\{(.+?)\}(\s+)\}', r'\1json_encoders={\2}\3}', text, flags=re.DOTALL)
    
    # Replace .dict(by_alias=True, exclude_unset=True) → .model_dump(by_alias=True, exclude_unset=True)
    text = text.replace('.dict(by_alias=True, exclude_unset=True)', '.model_dump(by_alias=True, exclude_unset=True)')
    
    # Add missing imports
    if 'field_validator' in text and 'from pydantic import' in text:
        if 'ConfigDict' not in text:
            text = text.replace('from pydantic import BaseModel, Field, field_validator', 'from pydantic import BaseModel, Field, field_validator, ConfigDict')
    
    path.write_text(text, encoding='utf-8')
    print(f"✓ Fixed {path}")

# Fix all model files
for model_file in models_dir.glob("*.py"):
    if model_file.name != "__init__.py":
        fix_file(model_file)

# Fix schema files
for schema_file in schemas_dir.glob("*.py"):
    if schema_file.name != "__init__.py":
        fix_file(schema_file)

print("\n✅ All Pydantic models updated to v2 syntax")
