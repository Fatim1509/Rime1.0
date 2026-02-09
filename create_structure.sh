#!/bin/bash

# Create directory structure
mkdir -p .github/workflows
mkdir -p infrastructure
mkdir -p services/core-engine/src/{types,agents,context-engine,integrations,memory,mock,tests}
mkdir -p services/screen-service/utils
mkdir -p shared/types
mkdir -p apps/dashboard/app/{components,lib}
mkdir -p apps/dashboard/public
mkdir -p apps/vscode-extension/{src,media}
mkdir -p apps/chrome-extension/icons
mkdir -p docs
mkdir -p scripts

echo "Directory structure created successfully"
