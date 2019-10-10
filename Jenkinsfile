def SERVICE_GROUP = "sample"
def SERVICE_NAME = "vue"
def IMAGE_NAME = "${SERVICE_GROUP}-${SERVICE_NAME}"
def REPOSITORY_URL = "https://github.com/gelius7/sample-vue.git"
def REPOSITORY_SECRET = ""
def SLACK_TOKEN_DEV = ""
def SLACK_TOKEN_DQA = ""

@Library("github.com/opsnow-tools/valve-butler")
def butler = new com.opsnow.valve.v7.Butler()
def label = "worker-${UUID.randomUUID().toString()}"

properties([
  buildDiscarder(logRotator(daysToKeepStr: "60", numToKeepStr: "30"))
])
podTemplate(label: label, containers: [
  containerTemplate(name: "builder", image: "opsnowtools/valve-builder:v0.2.2", command: "cat", ttyEnabled: true, alwaysPullImage: true),
  containerTemplate(name: "node", image: "node:10", command: "cat", ttyEnabled: true)
], volumes: [
  hostPathVolume(mountPath: "/var/run/docker.sock", hostPath: "/var/run/docker.sock"),
  hostPathVolume(mountPath: "/home/jenkins/.draft", hostPath: "/home/jenkins/.draft"),
  hostPathVolume(mountPath: "/home/jenkins/.helm", hostPath: "/home/jenkins/.helm")
]) {
  node(label) {
    stage("Prepare") {
      container("builder") {
        butler.prepare(IMAGE_NAME)
      }
    }
    stage("Checkout") {
      container("builder") {
        try {
          if (REPOSITORY_SECRET) {
            git(url: REPOSITORY_URL, branch: BRANCH_NAME, credentialsId: REPOSITORY_SECRET)
          } else {
            git(url: REPOSITORY_URL, branch: BRANCH_NAME)
          }
        } catch (e) {
          butler.failure(SLACK_TOKEN_DEV, "Checkout")
          throw e
        }

        butler.scan("nodejs")
      }
    }
    stage("Build") {
      container("node") {
        try {
          sh 'npm install'
          butler.npm_build()
          butler.success(SLACK_TOKEN_DEV, "Build")
        } catch (e) {
          butler.failure(SLACK_TOKEN_DEV, "Build")
          throw e
        }
      }
    }
    if (BRANCH_NAME == "master") {
      stage("Build Image") {
        parallel(
          "Build Docker": {
            container("builder") {
              try {
                butler.build_image()
              } catch (e) {
                butler.failure(SLACK_TOKEN_DEV, "Build Docker")
                throw e
              }
            }
          },
          "Build Charts": {
            container("builder") {
              try {
                butler.build_chart()
              } catch (e) {
                butler.failure(SLACK_TOKEN_DEV, "Build Charts")
                throw e
              }
            }
          }
        )
      }
      stage("Deploy Here") {
        container("builder") {
          try {
            // deploy(cluster, namespace, sub_domain, profile)
            butler.deploy("here", "${SERVICE_GROUP}-dev1", "${IMAGE_NAME}-dev", "dev")
            butler.success(SLACK_TOKEN_DEV, "Deploy DEV")
          } catch (e) {
            butler.failure(SLACK_TOKEN_DEV, "Deploy DEV")
            throw e
          }
        }
      }
    }
  }
}
