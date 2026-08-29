import os
import sys
import subprocess
from pathlib import Path

def generate():
    base_dir = Path(__file__).resolve().parent.parent
    root_dir = base_dir.parent.parent
    proto_dir = root_dir / "proto"
    proto_file = proto_dir / "cohort.proto"
    output_dir = base_dir / "app" / "proto"

    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Touch __init__.py
    (output_dir / "__init__.py").touch(exist_ok=True)

    print(f"Compiling {proto_file} -> {output_dir}")

    cmd = [
        sys.executable,
        "-m",
        "grpc_tools.protoc",
        f"-I{proto_dir}",
        f"--python_out={output_dir}",
        f"--grpc_python_out={output_dir}",
        f"--pyi_out={output_dir}",
        str(proto_file),
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error compiling proto: {res.stderr}")
        sys.exit(res.returncode)

    # Fix relative import in generated *_pb2_grpc.py
    grpc_file = output_dir / "cohort_pb2_grpc.py"
    if grpc_file.exists():
        content = grpc_file.read_text()
        content = content.replace("import cohort_pb2 as cohort__pb2", "from app.proto import cohort_pb2 as cohort__pb2")
        grpc_file.write_text(content)

    print("Successfully generated proto files!")

if __name__ == "__main__":
    generate()
