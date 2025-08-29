# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
      - img [ref=e8] [cursor=pointer]
    - generic [ref=e11] [cursor=pointer]:
      - button "Open issues overlay" [ref=e12] [cursor=pointer]:
        - generic [ref=e13] [cursor=pointer]:
          - generic [ref=e14] [cursor=pointer]: "1"
          - generic [ref=e15] [cursor=pointer]: "2"
        - generic [ref=e16] [cursor=pointer]:
          - text: Issue
          - generic [ref=e17] [cursor=pointer]: s
      - button "Collapse issues badge" [ref=e18] [cursor=pointer]:
        - img [ref=e19] [cursor=pointer]
  - alert [ref=e21]
  - banner [ref=e22]:
    - generic [ref=e23]:
      - link "CH Micro App" [ref=e25] [cursor=pointer]:
        - /url: /
        - generic [ref=e27] [cursor=pointer]: CH
        - generic [ref=e28] [cursor=pointer]: Micro App
      - generic [ref=e29]:
        - navigation [ref=e30]:
          - link "Home" [ref=e31] [cursor=pointer]:
            - /url: /
            - img [ref=e32] [cursor=pointer]
            - generic [ref=e35] [cursor=pointer]: Home
        - button "Open navigation menu" [ref=e36]:
          - img [ref=e37]
  - main [ref=e38]:
    - heading "Something went wrong in this route." [level=2] [ref=e39]
    - generic [ref=e40]: React.Children.only expected to receive a single React element child.
    - button "Try again" [ref=e41]
```