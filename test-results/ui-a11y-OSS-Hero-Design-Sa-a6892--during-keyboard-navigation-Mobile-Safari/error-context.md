# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
      - img [ref=e8] [cursor=pointer]
    - generic [ref=e13] [cursor=pointer]:
      - button "Open issues overlay" [ref=e14] [cursor=pointer]:
        - generic [ref=e15] [cursor=pointer]:
          - generic [ref=e16] [cursor=pointer]: "1"
          - generic [ref=e17] [cursor=pointer]: "2"
        - generic [ref=e18] [cursor=pointer]:
          - text: Issue
          - generic [ref=e19] [cursor=pointer]: s
      - button "Collapse issues badge" [ref=e20] [cursor=pointer]:
        - img [ref=e21] [cursor=pointer]
  - alert [ref=e23]
  - generic [ref=e24]:
    - banner [ref=e25]:
      - generic [ref=e26]:
        - link "CH Micro App" [ref=e28]:
          - /url: /
          - generic [ref=e30]: CH
          - generic [ref=e31]: Micro App
        - generic [ref=e32]:
          - navigation [ref=e33]:
            - link "Home" [ref=e34]:
              - /url: /
              - img [ref=e35]
              - generic [ref=e38]: Home
          - button "Open navigation menu" [ref=e39]:
            - img [ref=e40]
    - main [ref=e41]:
      - heading "Something went wrong in this route." [level=2] [ref=e42]
      - generic [ref=e43]: React.Children.only expected to receive a single React element child.
      - button "Try again" [ref=e44]
```