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
  - banner [ref=e24]:
    - generic [ref=e25]:
      - link "CH Micro App" [ref=e27]:
        - /url: /
        - generic [ref=e29]: CH
        - generic [ref=e30]: Micro App
      - generic [ref=e31]:
        - navigation [ref=e32]:
          - link "Home" [ref=e33]:
            - /url: /
            - img [ref=e34]
            - generic [ref=e37]: Home
        - button "Open navigation menu" [ref=e38]:
          - img [ref=e39]
  - main [ref=e40]:
    - heading "Something went wrong in this route." [level=2] [ref=e41]
    - generic [ref=e42]: React.Children.only expected to receive a single React element child.
    - button "Try again" [ref=e43]
```