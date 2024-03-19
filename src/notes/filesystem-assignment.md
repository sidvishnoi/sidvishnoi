# Filesystem Simulation in C++

Dec 20, 2017

> [sidvishnoi/filesystem-simulation][1] > [sidvishnoi/filesystem-assignment][2]

This is a project I made during my Masters at Computer Applications course at Dept. of Computer Science, university of Delhi.

The program lets you create a filesystem as a file and allows you to do file/directory operations in a Linux like terminal interface.

It allows you to create files, create hierarchical directories, delete files and (attempt to) recover deleted files, along with operations like list directory, print directory tree, print working directory, change directory.

![filesystem simulation demo](https://user-images.githubusercontent.com/8426945/62230627-d4284a80-b3df-11e9-9630-bc3dd471df03.png)

Based on this, I created a file handling [assignment][2] (educative material) made to teach some ideas about file systems and gain user's experience in C++ file handling.

The design makes use of a linked list and is somewhat similar to FAT. In the first few sectors, some space is reserved for pointers and status of other sectors.

[1]: https://github.com/sidvishnoi/filesystem-simulation
[2]: https://github.com/sidvishnoi/filesystem-assignment
