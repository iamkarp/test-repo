# NemoClaw - Vast.ai Instance Requirements

## Overview

[NVIDIA NemoClaw](https://docs.nvidia.com/nemoclaw/latest/) is an open source
reference stack for running OpenClaw assistants securely inside NVIDIA OpenShell.
It is currently in early preview (alpha) as of March 2026.

## Do You Even Need a GPU?

NemoClaw defaults to **cloud inference** via NVIDIA's hosted API (Nemotron 3
Super 120B on build.nvidia.com). In this mode, no local GPU is required — a
cheap CPU-only instance is sufficient. You just need an NVIDIA API key.

A GPU instance on vast.ai is only needed if you want to run **local inference**
via Ollama or vLLM.

## Local Inference Requirements (vast.ai)

### Nemotron Nano 30B (Recommended for development)

| Resource     | Requirement              |
| ------------ | ------------------------ |
| **GPU**      | 1x RTX 4090 (24 GB VRAM)|
| **RAM**      | 32 GB+                   |
| **CPU**      | 6+ cores                 |
| **Disk**     | 50 GB+ free              |
| **OS**       | Ubuntu 22.04+ with Docker|
| **Est. cost**| ~$0.20-0.50/hr on vast.ai|

### Nemotron 3 Super 120B (Full model)

| Resource     | Requirement                      |
| ------------ | -------------------------------- |
| **GPU**      | 2x A100 80 GB or 2x H100 80 GB  |
| **RAM**      | 64 GB+                           |
| **CPU**      | 8+ cores                         |
| **Disk**     | 87 GB+ free (model weights alone)|
| **OS**       | Ubuntu 22.04+ with Docker        |

## Software Prerequisites

- Docker with NVIDIA Container Toolkit
- Node.js v20+
- Ollama (for local inference) or vLLM
- GitHub CLI (gh) for downloading OpenShell CLI

## Vast.ai Search Filters

When searching for instances on vast.ai:

- **GPU Model**: RTX 4090 for Nano 30B; A100 80GB or H100 for Super 120B
- **VRAM**: 24 GB minimum (Nano) or 160 GB+ (Super 120B)
- **Disk space**: 50-100 GB minimum
- **Docker image**: Ubuntu 22.04 with CUDA

## References

- [NemoClaw Developer Guide](https://docs.nvidia.com/nemoclaw/latest/)
- [NemoClaw Quickstart](https://docs.nvidia.com/nemoclaw/latest/get-started/quickstart.html)
- [Deploy to Remote GPU](https://docs.nvidia.com/nemoclaw/latest/deployment/deploy-to-remote-gpu.html)
- [NemoClaw GitHub](https://github.com/NVIDIA/NemoClaw)
