# Code specification-backend
  This specification is based on Google Java Style Guide.

## Source description
  Main reference：Google Java Style Guide
  Reference link：https://google.github.io/styleguide/javaguide.html

## Java code specification

### Naming specification
  Class name: big hump, such as 'ContactController'
  Method name: small hump, such as 'getAllContacts'
  Variable name: small hump, such as 'contactRepository'
  Constant: all uppercase and underlined, such as API_VERSION.

### Code format
  Indent with 4 spaces.
  No more than 100 characters per line. 
  There is a blank line between the class and the method 
  use Javadoc comments

### Package structure specification
  com.23124890/
  ├── entity/ 
  ├── repository/ 
  └── controller/

### Annotation usage specification 
  Entity classes use JPA annotations:`@Entity`, `@Table`, `@Id`
  The controller uses Spring annotations:`@RestController`, `@RequestMapping`
  Repository uses:`@Repository`

## Submit specification

### Commit Message format
  feat: New features
  fix: fix the bug
  docs: document update
  style: code formatting adjustment
  refactor: code refactoring
