---
title: Building a Custom React Renderer
date: 2023-10-15
description: React renderers are powerful. In this post, we'll dive deep into the Reconciler API.
published: true
tags:
    - React
    - Internals
---

# Building a Custom React Renderer

React renderers are powerful. In this post, we'll dive deep into the Reconciler API and build a custom renderer from scratch. It's not magic, it's just trees and mutations.

## 1. The Reconciler API

To start, you need to import the `react-reconciler` package and define your `HostConfig` object. This object contains the methods React will call to mutate your target environment.

```tsx
import ReactReconciler from 'react-reconciler'

const HostConfig = {
    // Create an instance of your target element
    createInstance(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
        if (type === 'custom-div') {
            return { type: 'div', props }
        }
        throw new Error(`Cannot create element of type: ${type}`)
    },

    // ... other required methods
    supportsMutation: true,
}

const reconciler = ReactReconciler(HostConfig)
```

The `createInstance` function is the core of it all. It dictates what primitive element your renderer outputs when React asks for a specific tag.

### Understanding Mutability

Notice we set `supportsMutation: true`. This tells React that our target environment supports in-place updates (like the DOM).
