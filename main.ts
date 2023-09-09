import { App, Menu, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	bookShellFolderPath: string;
	bookNotesFolderPath: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	bookShellFolderPath: "",
	bookNotesFolderPath: "",
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('package-search', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
			new SampleModal(this.app).open();



			const menu = new Menu();

			menu.addItem((item) =>
				item
					.setTitle("Copy")
					.setIcon("documents")
					.onClick(() => {
						new Notice("Copied");
					})
			);
			menu.showAtMouseEvent(evt);
		});

		// options into clicking icon
		// this.registerEvent(
		// 	this.app.workspace.on("file-menu", (menu, file) => {
		// 		menu.addItem((item) => {
		// 			item
		// 				.setTitle("Print file path 👈")
		// 				.setIcon("document")
		// 				.onClick(async () => {
		// 					new Notice(file.path);
		// 				});
		// 		});
		// 	})
		// );

		// text into ... options
		// this.registerEvent(
		// 	this.app.workspace.on("editor-menu", (menu, editor, view) => {
		// 		menu.addItem((item) => {
		// 			item
		// 				.setTitle("Print file path 👈")
		// 				.setIcon("document")
		// 				.onClick(async () => {
		// 					new Notice(view.file?.path);
		// 				});
		// 		});
		// 	})
		// );


		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!2');

		// // create a fields for new book
		// new Setting(contentEl)
		// 	.setName('Field 1')
		// 	.setDesc('Description for Field 1')
		// 	.addText(text => text
		// 		.setPlaceholder('Enter value for Field 1')
		// 		.setValue('') // Початкове значення
		// 		.onChange(async (value) => {
		// 			// Обробник події при зміні значення поля 1
		// 			console.log('Field 1 value changed:', value);
		// 		}));
				
		


		// contentEl.createEl('button', { text: 'Save' }).addEventListener('click', () => {
		// 	// Отримайте значення полів та збережіть їх
		// 	const field1Value = 1;
		// 	const field2Value = 2;
		// 	const field3Value = 3;

		// 	// Збережіть значення або зробіть з ними щось інше за потребою
		// 	console.log('Field 1 value:', field1Value);
		// 	console.log('Field 2 value:', field2Value);
		// 	console.log('Field 3 value:', field3Value);

		// 	// Закрийте модальне вікно
		// 	this.close();
		// });

		// Створіть обробник події для перетягування файлу
		contentEl.addEventListener('dragover', (event) => {
			event.preventDefault();
			event.stopPropagation();
			//new Notice("dragover");
		});

		contentEl.addEventListener('drop', async (event) => {
			event.preventDefault();
			event.stopPropagation();

			const files = event.dataTransfer?.files;
			if (!files) {
				return;
			}

			new Notice("drop");
			new Notice( (files.length).toString());
			if (files.length > 0) {
				// Отримайте перший файл зі списку
				const file = files[0];
				new Notice("File name: " + file.name);
				// Отримайте дані з файлу
				const fileContents = await this.readFileContents(file);

				// Обробіть отримані дані, наприклад, виведіть їх у вікно
				new Notice("File name: " + file.name);
				//new Notice("File contents: "+ fileContents);
			}
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}

	async readFileContents(file: Blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			new Notice("readFileContents");

			reader.onload = (event) => {
				// general code for read
				const contents = event.target?.result;
				resolve(contents);
			};

			reader.onerror = (event) => {
				new Notice("Some error happend in readFileContents");
				reject(event.error);
			};

			reader.readAsText(file);
			new Notice("readFileContents2");
		});
	}
}


class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl("div", { text: "Settings" });

		new Setting(containerEl)
			.setName('Path to bookshell folder')
			.setDesc('Where you have a digital books')
			.addText(text => text
				.setPlaceholder('Put folder path')
				.setValue(this.plugin.settings.bookShellFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.bookShellFolderPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Path to notes bookshell folder')
			.setDesc('Where you save notes about books')
			.addText(text => text
				.setPlaceholder('Put folder path')
				.setValue(this.plugin.settings.bookNotesFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.bookNotesFolderPath = value;
					await this.plugin.saveSettings();
				}));
				
	}
}
