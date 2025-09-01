#!/usr/bin/env python3
"""
API Editor/Modifier Tool

This tool allows you to transform APIs from one company format to another.
It supports OpenAPI/Swagger specifications and provides a rule-based
transformation system.

Usage:
    python api_editor.py transform input_api.yaml config.yaml output_api.yaml
    python api_editor.py validate input_api.yaml
"""

import yaml
import json
import click
import sys
from typing import Dict, List, Any, Optional
from pathlib import Path
import re


class APITransformer:
    """Main class for API transformation logic."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.transformation_rules = config.get('transformation_rules', {})
        
    def load_api_spec(self, file_path: str) -> Dict[str, Any]:
        """Load API specification from YAML or JSON file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                if file_path.endswith('.json'):
                    return json.load(file)
                else:
                    return yaml.safe_load(file)
        except Exception as e:
            click.echo(f"Error loading API spec from {file_path}: {e}", err=True)
            sys.exit(1)
    
    def save_api_spec(self, api_spec: Dict[str, Any], file_path: str):
        """Save API specification to YAML or JSON file."""
        try:
            with open(file_path, 'w', encoding='utf-8') as file:
                if file_path.endswith('.json'):
                    json.dump(api_spec, file, indent=2)
                else:
                    yaml.dump(api_spec, file, default_flow_style=False, indent=2)
            click.echo(f"API specification saved to {file_path}")
        except Exception as e:
            click.echo(f"Error saving API spec to {file_path}: {e}", err=True)
            sys.exit(1)
    
    def transform_info(self, api_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Transform the info section of the API spec."""
        info_rules = self.transformation_rules.get('info', {})
        
        if 'info' in api_spec:
            info = api_spec['info'].copy()
            
            # Apply transformations
            if 'title' in info_rules:
                info['title'] = info_rules['title']
            
            if 'description' in info_rules:
                info['description'] = info_rules['description']
            
            if 'version' in info_rules:
                info['version'] = info_rules['version']
            
            # Add company-specific contact info
            if 'contact' in info_rules:
                info['contact'] = info_rules['contact']
            
            api_spec['info'] = info
        
        return api_spec
    
    def transform_servers(self, api_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Transform server URLs and descriptions."""
        server_rules = self.transformation_rules.get('servers', {})
        
        if server_rules and 'servers' in api_spec:
            new_servers = []
            
            for rule in server_rules:
                server = {
                    'url': rule.get('url', 'https://api.example.com'),
                    'description': rule.get('description', 'Production server')
                }
                new_servers.append(server)
            
            api_spec['servers'] = new_servers
        
        return api_spec
    
    def transform_paths(self, api_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Transform API paths and operations."""
        path_rules = self.transformation_rules.get('paths', {})
        
        if 'paths' in api_spec and path_rules:
            new_paths = {}
            
            for original_path, path_data in api_spec['paths'].items():
                # Apply path prefix/suffix transformations
                new_path = original_path
                
                if 'prefix' in path_rules:
                    new_path = path_rules['prefix'] + new_path
                
                if 'suffix' in path_rules:
                    new_path = new_path + path_rules['suffix']
                
                # Apply path replacements
                if 'replacements' in path_rules:
                    for replacement in path_rules['replacements']:
                        pattern = replacement.get('from', '')
                        replacement_text = replacement.get('to', '')
                        new_path = re.sub(pattern, replacement_text, new_path)
                
                # Transform operations within the path
                if 'operations' in path_rules:
                    path_data = self.transform_operations(path_data, path_rules['operations'])
                
                new_paths[new_path] = path_data
            
            api_spec['paths'] = new_paths
        
        return api_spec
    
    def transform_operations(self, path_data: Dict[str, Any], operation_rules: Dict[str, Any]) -> Dict[str, Any]:
        """Transform individual operations (GET, POST, etc.)."""
        for method, operation in path_data.items():
            if isinstance(operation, dict):
                # Add or modify operation properties
                if 'tags' in operation_rules:
                    operation['tags'] = operation_rules['tags']
                
                if 'security' in operation_rules:
                    operation['security'] = operation_rules['security']
                
                # Transform responses
                if 'responses' in operation_rules and 'responses' in operation:
                    operation = self.transform_responses(operation, operation_rules['responses'])
        
        return path_data
    
    def transform_responses(self, operation: Dict[str, Any], response_rules: Dict[str, Any]) -> Dict[str, Any]:
        """Transform operation responses."""
        if 'responses' in operation:
            responses = operation['responses']
            
            # Add default responses if specified
            if 'add_defaults' in response_rules:
                for status_code, response_data in response_rules['add_defaults'].items():
                    if status_code not in responses:
                        responses[status_code] = response_data
        
        return operation
    
    def transform_components(self, api_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Transform components section (schemas, security schemes, etc.)."""
        component_rules = self.transformation_rules.get('components', {})
        
        if 'components' in api_spec and component_rules:
            components = api_spec['components']
            
            # Transform security schemes
            if 'securitySchemes' in component_rules:
                components['securitySchemes'] = component_rules['securitySchemes']
            
            # Add custom schemas
            if 'schemas' in component_rules:
                if 'schemas' not in components:
                    components['schemas'] = {}
                components['schemas'].update(component_rules['schemas'])
        
        return api_spec
    
    def transform(self, input_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Apply all transformations to the API specification."""
        api_spec = input_spec.copy()
        
        # Apply transformations in sequence
        api_spec = self.transform_info(api_spec)
        api_spec = self.transform_servers(api_spec)
        api_spec = self.transform_paths(api_spec)
        api_spec = self.transform_components(api_spec)
        
        return api_spec


@click.group()
def cli():
    """API Editor/Modifier Tool - Transform APIs from one company format to another."""
    pass


@cli.command()
@click.argument('input_file', type=click.Path(exists=True))
@click.argument('config_file', type=click.Path(exists=True))
@click.argument('output_file', type=click.Path())
def transform(input_file: str, config_file: str, output_file: str):
    """Transform an API specification using a configuration file.
    
    INPUT_FILE: Path to the input API specification (YAML or JSON)
    CONFIG_FILE: Path to the transformation configuration file (YAML)
    OUTPUT_FILE: Path where the transformed API specification will be saved
    """
    click.echo(f"Loading configuration from {config_file}...")
    
    try:
        with open(config_file, 'r', encoding='utf-8') as file:
            config = yaml.safe_load(file)
    except Exception as e:
        click.echo(f"Error loading configuration: {e}", err=True)
        sys.exit(1)
    
    transformer = APITransformer(config)
    
    click.echo(f"Loading API specification from {input_file}...")
    input_spec = transformer.load_api_spec(input_file)
    
    click.echo("Applying transformations...")
    output_spec = transformer.transform(input_spec)
    
    click.echo(f"Saving transformed API specification to {output_file}...")
    transformer.save_api_spec(output_spec, output_file)
    
    click.echo("✅ API transformation completed successfully!")


@cli.command()
@click.argument('api_file', type=click.Path(exists=True))
def validate(api_file: str):
    """Validate an API specification file.
    
    API_FILE: Path to the API specification file to validate
    """
    click.echo(f"Validating API specification: {api_file}")
    
    try:
        transformer = APITransformer({})
        api_spec = transformer.load_api_spec(api_file)
        
        # Basic validation
        required_fields = ['openapi', 'info', 'paths']
        missing_fields = [field for field in required_fields if field not in api_spec]
        
        if missing_fields:
            click.echo(f"❌ Missing required fields: {', '.join(missing_fields)}", err=True)
            sys.exit(1)
        
        click.echo("✅ API specification is valid!")
        click.echo(f"   Title: {api_spec.get('info', {}).get('title', 'N/A')}")
        click.echo(f"   Version: {api_spec.get('info', {}).get('version', 'N/A')}")
        click.echo(f"   Paths: {len(api_spec.get('paths', {}))}")
        
    except Exception as e:
        click.echo(f"❌ Validation failed: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.argument('config_file', type=click.Path())
def create_config(config_file: str):
    """Create a sample transformation configuration file.
    
    CONFIG_FILE: Path where the sample configuration will be created
    """
    sample_config = {
        'transformation_rules': {
            'info': {
                'title': 'Company Y API (Transformed from Company X)',
                'description': 'This API has been transformed from Company X format to Company Y format',
                'version': '1.0.0',
                'contact': {
                    'name': 'Company Y API Team',
                    'email': 'api@company-y.com',
                    'url': 'https://company-y.com/api'
                }
            },
            'servers': [
                {
                    'url': 'https://api.company-y.com/v1',
                    'description': 'Company Y Production Server'
                },
                {
                    'url': 'https://staging-api.company-y.com/v1',
                    'description': 'Company Y Staging Server'
                }
            ],
            'paths': {
                'prefix': '/api/v1',
                'replacements': [
                    {
                        'from': 'company-x',
                        'to': 'company-y'
                    }
                ],
                'operations': {
                    'tags': ['Company Y API'],
                    'security': [{'ApiKeyAuth': []}],
                    'responses': {
                        'add_defaults': {
                            '401': {
                                'description': 'Unauthorized - Invalid API key'
                            },
                            '429': {
                                'description': 'Too Many Requests - Rate limit exceeded'
                            }
                        }
                    }
                }
            },
            'components': {
                'securitySchemes': {
                    'ApiKeyAuth': {
                        'type': 'apiKey',
                        'in': 'header',
                        'name': 'X-API-Key'
                    }
                },
                'schemas': {
                    'Error': {
                        'type': 'object',
                        'properties': {
                            'code': {
                                'type': 'integer',
                                'format': 'int32'
                            },
                            'message': {
                                'type': 'string'
                            }
                        },
                        'required': ['code', 'message']
                    }
                }
            }
        }
    }
    
    try:
        with open(config_file, 'w', encoding='utf-8') as file:
            yaml.dump(sample_config, file, default_flow_style=False, indent=2)
        
        click.echo(f"✅ Sample configuration created: {config_file}")
        click.echo("Edit this file to customize your API transformation rules.")
        
    except Exception as e:
        click.echo(f"❌ Error creating configuration file: {e}", err=True)
        sys.exit(1)


if __name__ == '__main__':
    cli()