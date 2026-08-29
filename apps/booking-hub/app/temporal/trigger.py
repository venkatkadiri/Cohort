import asyncio
import os
import sys

# Ensure python path includes domain service root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.temporal.client import trigger_hello_workflow, trigger_regenerate_workflow

async def main():
    print("⏳ Triggering Python Temporal Workflow (HelloWorkflow)...")
    result = await trigger_hello_workflow("Dexter")
    print(f"🎉 Workflow executed successfully! Result: {result}")

if __name__ == "__main__":
    asyncio.run(main())
