import { Tools } from "@halcyontech/vscode-ibmi-types/api/Tools";
import vscode, { l10n } from "vscode";
import { code4i } from "./extension";
import { TreeNode, TreeNodeDataProvider, TreeNodeParameters } from "./treeview";

export function initializeJobBrowser(context: vscode.ExtensionContext) {
  const jobBrowser = new JobBrowser();
  const jobTreeViewer = vscode.window.createTreeView(
    `byoe.jobBrowser`, {
    treeDataProvider: jobBrowser,
    showCollapseAll: true,
    canSelectMany: false
  });

  context.subscriptions.push(
    jobTreeViewer,
    vscode.commands.registerCommand("jobBrowser.refresh", (item: TreeNode) => jobBrowser.refresh()),
    vscode.commands.registerCommand("jobBrowser.refresh.item", (item: TreeNode) => jobBrowser.refresh(item))
  );
}

class JobBrowser extends TreeNodeDataProvider {
  getRootElements() {
    return [
      new MyJobsNode(),
      new SubSystemsNode()
    ];
  }
}

class JobBrowserNode extends TreeNode {
  constructor(label: string, params?: TreeNodeParameters) {
    super(label, "jobBrowser.refresh.item", params);
  }
}

class MyJobsNode extends JobBrowserNode {
  constructor() {
    super(l10n.t("My Jobs"), { state: vscode.TreeItemCollapsibleState.Collapsed });
  }

  async getChildren() {
    const jobs = await code4i.instance.getConnection().runSQL("select * from table(qsys2.job_info()) Order BY JOB_NAME_SHORT");
    return jobs.map(job => new JobNode(job));
  }
}

class SubSystemsNode extends JobBrowserNode {
  constructor() {
    super(l10n.t("Subsystems"), { state: vscode.TreeItemCollapsibleState.Collapsed });
  }

  async getChildren() {
    const subsystems = await code4i.instance.getConnection().runSQL(`SELECT * FROM QSYS2.SUBSYSTEM_INFO WHERE STATUS = 'ACTIVE'`);
    return subsystems.map(job => new SubsystemNode(job));
  }
}

class SubsystemNode extends JobBrowserNode {
  constructor(readonly subsystem: Tools.DB2Row) {
    super(`${subsystem.SUBSYSTEM_DESCRIPTION}`, { state: vscode.TreeItemCollapsibleState.Collapsed, icon: "server-process" });
    this.description = `${subsystem.TEXT_DESCRIPTION || ""} (${subsystem.CURRENT_ACTIVE_JOBS})`.trim();
  }

  async getChildren() {
    const jobs = await code4i.instance.getConnection().runSQL(`select * from table(qsys2.job_info(job_subsystem_filter => '${this.subsystem.SUBSYSTEM_DESCRIPTION}', JOB_USER_FILTER => '*ALL')) Order BY JOB_NAME_SHORT`);
    return jobs.map(job => new JobNode(job));
  }
}

class JobNode extends JobBrowserNode {
  constructor(readonly job: Tools.DB2Row) {
    super(job.JOB_NAME as string, { state: vscode.TreeItemCollapsibleState.None, icon: "gear" });
  }
}