# Pyodide Moodle Python Runner

This version supports:

- print()
- input()
- int(input())
- multiple input() calls
- reading uploaded text files with open("filename.txt")
- writing files with open("output.txt", "w")
- downloading files created by Python

Example input code:

```python
name = input("Enter your name: ")
age = int(input("Enter your age: "))
print("Hello", name)
print("Next year you will be", age + 1)
```

Example file reading:

```python
file = open("names.txt")
for line in file:
    print(line.strip())
file.close()
```

Example file writing:

```python
file = open("output.txt", "w")
file.write("Hello from Python")
file.close()
```
