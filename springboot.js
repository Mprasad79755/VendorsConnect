import http from 'http';
import os from 'os';

const banner = `
  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.1.2)
`;

console.log(banner);

const hostname = os.hostname();
const pid = process.pid;

const logs = [
  `INFO ${pid} --- [           main] com.example.demo.DemoApplication         : Starting DemoApplication using Java 17.0.8 on ${hostname} with PID ${pid}`,
  `INFO ${pid} --- [           main] com.example.demo.DemoApplication         : No active profile set, falling back to 1 default profile: "default"`,
  `INFO ${pid} --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)`,
  `INFO ${pid} --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]`,
  `INFO ${pid} --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.11]`,
  `INFO ${pid} --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext`,
  `INFO ${pid} --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 1234 ms`,
  `INFO ${pid} --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''`,
  `INFO ${pid} --- [           main] com.example.demo.DemoApplication         : Started DemoApplication in 2.345 seconds (process running for 2.876)`
];

function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}+05:30`;
}

let delay = 0;
logs.forEach((log) => {
  setTimeout(() => {
    console.log(`${getFormattedDate()}  ${log}`);
  }, delay);
  delay += Math.floor(Math.random() * 400) + 100;
});

setTimeout(() => {
  let firstRequest = true;

  http.createServer((req, res) => {
    const timestamp = getFormattedDate();

    if (firstRequest) {
      console.log(`${timestamp}  INFO ${pid} --- [nio-8080-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'`);
      console.log(`${timestamp}  INFO ${pid} --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'`);
      console.log(`${timestamp}  INFO ${pid} --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 2 ms`);
      firstRequest = false;
    }

    console.log(`${timestamp}  INFO ${pid} --- [nio-8080-exec-1] com.example.demo.DemoController          : Received request: ${req.method} ${req.url}`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      timestamp: new Date().toISOString(),
      status: 200,
      message: "Success",
      data: {
        info: " Spring Boot backend is actively running!"
      }
    }));
  }).listen(8080, () => {
    // Silent
  });
}, delay + 100);
